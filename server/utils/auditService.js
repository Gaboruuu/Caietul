import { Op } from "sequelize";

const OBSERVATION_THRESHOLD = 50;
const BURST_WINDOW_MS = 5 * 60 * 1000;
const BURST_ACTION_LIMIT = 18;
const RISKY_PATTERNS = [
  /union\s+select/i,
  /or\s+1=1/i,
  /drop\s+table/i,
  /truncate\s+table/i,
  /<script/i,
  /\.\./,
  /sleep\s*\(/i,
  /benchmark\s*\(/i,
  /;--/,
];

const actionToString = (method, path, operationName = null) => {
  const upperMethod = String(method || "UNKNOWN").toUpperCase();
  const cleanPath = path || "/";

  if (operationName) {
    return `${upperMethod} ${cleanPath} :: ${operationName}`;
  }

  return `${upperMethod} ${cleanPath}`;
};

export const parseRolesHeader = (rolesHeader) => {
  if (!rolesHeader) {
    return [];
  }

  if (Array.isArray(rolesHeader)) {
    return rolesHeader.filter(Boolean).map((role) => String(role));
  }

  if (typeof rolesHeader !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(rolesHeader);
    if (Array.isArray(parsed)) {
      return parsed.filter(Boolean).map((role) => String(role));
    }
  } catch {
    // fall through to comma-separated parsing
  }

  return rolesHeader
    .split(",")
    .map((role) => role.trim())
    .filter(Boolean);
};

export const getRequestActor = (request) => {
  const userId = request.headers["x-user-id"];
  const userEmail = request.headers["x-user-email"];
  const userName = request.headers["x-user-name"];
  const roles = parseRolesHeader(request.headers["x-user-roles"]);

  if (!userId && !userEmail) {
    return null;
  }

  return {
    userId: typeof userId === "string" ? userId : null,
    userEmail: typeof userEmail === "string" ? userEmail : null,
    userName: typeof userName === "string" ? userName : null,
    roles,
    userGroup: roles.includes("admin") ? "ADMIN" : "USER",
  };
};

export const attachAuditActor = (request, _response, next) => {
  request.auditActor = getRequestActor(request);
  next();
};

const extractGraphQLOperationName = (query) => {
  if (typeof query !== "string") {
    return null;
  }

  const match = query
    .trim()
    .match(/^(query|mutation|subscription)\s+([A-Za-z0-9_]+)/i);
  return match ? match[2] : null;
};

const buildAuditMetadata = (request, response, actor, actionInformation) => ({
  requestPath: request.originalUrl || request.url || "/",
  requestMethod: request.method,
  queryKeys:
    request.query && typeof request.query === "object"
      ? Object.keys(request.query)
      : [],
  statusCode: response.statusCode,
  userAgent: request.headers["user-agent"] || null,
  ipAddress: request.ip || request.socket?.remoteAddress || null,
  actor: {
    userId: actor.userId,
    userEmail: actor.userEmail,
    userGroup: actor.userGroup,
    roles: actor.roles,
  },
  actionInformation,
});

const buildActionInformation = (request) => {
  const path = request.originalUrl || request.url || "/";

  if (path.startsWith("/graphql")) {
    const operationName = extractGraphQLOperationName(request.body?.query);
    return actionToString(request.method, path, operationName);
  }

  return actionToString(request.method, path);
};

const countRecentActions = async (models, actor, timestamp) => {
  if (!models?.AuditLog || !actor?.userId) {
    return 0;
  }

  const windowStart = new Date(timestamp.getTime() - BURST_WINDOW_MS);
  return await models.AuditLog.count({
    where: {
      userId: actor.userId,
      timestamp: {
        [Op.gte]: windowStart,
      },
    },
  });
};

const detectSuspicionSignals = ({
  actor,
  request,
  response,
  actionInformation,
  recentActionCount,
}) => {
  const reasons = [];
  let score = 0;

  const path = (request.originalUrl || request.url || "").toLowerCase();
  const actionText = `${actionInformation} ${path}`.toLowerCase();
  const requestPayload = JSON.stringify({
    query: request.query,
    body: request.body,
  }).toLowerCase();

  if (response.statusCode >= 500) {
    score += 20;
    reasons.push("server_error_response");
  }

  if (response.statusCode === 401 || response.statusCode === 403) {
    score += 25;
    reasons.push("blocked_or_forbidden_attempt");
  }

  if (actionText.includes("delete") || actionText.includes("destroy")) {
    score += 15;
    reasons.push("destructive_action");
  }

  if (actor?.roles?.includes("admin") && actionText.includes("security")) {
    score += 5;
    reasons.push("admin_security_review");
  }

  for (const pattern of RISKY_PATTERNS) {
    if (pattern.test(requestPayload) || pattern.test(actionText)) {
      score += 30;
      reasons.push(`pattern:${pattern}`);
    }
  }

  if (recentActionCount + 1 >= BURST_ACTION_LIMIT) {
    score += 35;
    reasons.push(`burst_${recentActionCount + 1}_actions_in_window`);
  }

  return { score, reasons };
};

const upsertObservation = async (models, actor, logEntry, score, reasons) => {
  if (!models?.SuspiciousObservation || !actor?.userId) {
    return null;
  }

  const now = new Date(logEntry.timestamp);
  const where = { userId: actor.userId };
  const existing = await models.SuspiciousObservation.findOne({ where });

  const reasonDetails = Array.from(
    new Set([...(existing?.reasonDetails || []), ...reasons]),
  );
  const reasonSummary = reasonDetails.join("; ");

  if (!existing) {
    return await models.SuspiciousObservation.create({
      userId: actor.userId,
      userEmail: actor.userEmail || actor.userName || actor.userId,
      userGroup: actor.userGroup,
      riskScore: score,
      occurrenceCount: 1,
      status: "observed",
      reasonSummary,
      reasonDetails,
      firstSeenAt: now,
      lastSeenAt: now,
      lastLogId: logEntry.id,
    });
  }

  const nextOccurrenceCount = existing.occurrenceCount + 1;
  const nextRiskScore = Math.max(existing.riskScore, score);

  await existing.update({
    userEmail: actor.userEmail || existing.userEmail,
    userGroup: actor.userGroup,
    riskScore: nextRiskScore,
    occurrenceCount: nextOccurrenceCount,
    status: "observed",
    reasonSummary,
    reasonDetails,
    lastSeenAt: now,
    lastLogId: logEntry.id,
  });

  return existing;
};

export const recordAuditEvent = async (models, request, response) => {
  if (!models?.AuditLog) {
    return null;
  }

  const actor = request.auditActor || getRequestActor(request);
  if (!actor) {
    return null;
  }

  const timestamp = new Date();
  const actionInformation = buildActionInformation(request);
  const recentActionCount = await countRecentActions(models, actor, timestamp);
  const { score, reasons } = detectSuspicionSignals({
    actor,
    request,
    response,
    actionInformation,
    recentActionCount,
  });
  const entrySummary = `${actor.userId || "anonymous"}:${actor.userGroup}:${actionInformation}:${timestamp.toISOString()}`;

  const logEntry = await models.AuditLog.create({
    userId: actor.userId,
    userEmail: actor.userEmail || actor.userName || null,
    userGroup: actor.userGroup,
    actionInformation,
    requestMethod: request.method,
    requestPath: request.originalUrl || request.url || "/",
    statusCode: response.statusCode,
    timestamp,
    riskScore: score,
    suspicionReasons: reasons,
    metadata: buildAuditMetadata(request, response, actor, actionInformation),
    entrySummary,
  });

  if (score >= OBSERVATION_THRESHOLD) {
    await upsertObservation(models, actor, logEntry, score, reasons);
  }

  return logEntry;
};

export const createAuditTrailMiddleware = (models) => {
  return (request, response, next) => {
    const actor = request.auditActor;

    if (!models?.AuditLog || !actor) {
      return next();
    }

    if (request.method === "HEAD" || request.method === "OPTIONS") {
      return next();
    }

    const originalEnd = response.end.bind(response);
    let auditRecorded = false;

    response.end = (...args) => {
      if (auditRecorded) {
        return originalEnd(...args);
      }

      auditRecorded = true;
      void recordAuditEvent(models, request, response)
        .catch((error) => {
          console.error("[Audit] Failed to record event", error);
        })
        .finally(() => {
          originalEnd(...args);
        });

      return response;
    };

    return next();
  };
};

export const getSecurityDashboard = async (models, limit = 50) => {
  if (!models?.AuditLog || !models?.SuspiciousObservation) {
    return {
      summary: {
        totalLogs: 0,
        activeObservations: 0,
        highestRiskScore: 0,
        recentSuspiciousLogs: 0,
      },
      recentLogs: [],
      observations: [],
    };
  }

  const [totalLogs, activeObservations, recentLogs, observations] =
    await Promise.all([
      models.AuditLog.count(),
      models.SuspiciousObservation.count({ where: { status: "observed" } }),
      models.AuditLog.findAll({
        order: [["timestamp", "DESC"]],
        limit,
      }),
      models.SuspiciousObservation.findAll({
        order: [["riskScore", "DESC"]],
      }),
    ]);

  const highestRiskScore = observations.reduce(
    (max, observation) => Math.max(max, observation.riskScore),
    0,
  );

  const recentSuspiciousLogs = recentLogs.filter(
    (log) => log.riskScore >= OBSERVATION_THRESHOLD,
  ).length;

  return {
    summary: {
      totalLogs,
      activeObservations,
      highestRiskScore,
      recentSuspiciousLogs,
    },
    recentLogs: recentLogs.map((log) => log.toJSON()),
    observations: observations.map((observation) => observation.toJSON()),
  };
};

export const resolveObservation = async (models, observationId) => {
  if (!models?.SuspiciousObservation) {
    return null;
  }

  const observation = await models.SuspiciousObservation.findByPk(observationId);
  if (!observation) {
    return null;
  }

  await observation.update({ status: "cleared" });
  return observation.toJSON();
};