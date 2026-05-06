export type SecuritySummary = {
  totalLogs: number;
  activeObservations: number;
  highestRiskScore: number;
  recentSuspiciousLogs: number;
};

export type SecurityLog = {
  id: string;
  userId: string | null;
  userEmail: string | null;
  userGroup: string;
  actionInformation: string;
  requestMethod: string;
  requestPath: string;
  statusCode: number;
  timestamp: string;
  riskScore: number;
  suspicionReasons: string[];
  metadata: Record<string, unknown>;
  entrySummary: string;
};

export type SuspiciousObservation = {
  id: string;
  userId: string;
  userEmail: string;
  userGroup: string;
  riskScore: number;
  occurrenceCount: number;
  status: string;
  reasonSummary: string;
  reasonDetails: string[];
  firstSeenAt: string;
  lastSeenAt: string;
  lastLogId: string | null;
};

export type SecurityDashboard = {
  summary: SecuritySummary;
  recentLogs: SecurityLog[];
  observations: SuspiciousObservation[];
};
