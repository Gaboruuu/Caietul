import { describe, expect, it } from "vitest";
import {
  getSecurityDashboard,
  recordAuditEvent,
  resolveObservation,
} from "./auditService.js";

const createFakeModels = () => {
  const logs = [];
  const observations = [];

  const AuditLog = {
    async create(entry) {
      const record = {
        id: `log-${logs.length + 1}`,
        ...entry,
        toJSON() {
          return this;
        },
      };

      logs.push(record);
      return record;
    },
    async count({ where } = {}) {
      if (!where) {
        return logs.length;
      }

      return logs.filter((entry) => {
        if (where.userId && entry.userId !== where.userId) {
          return false;
        }

        if (where.timestamp) {
          const [gteSymbol] = Object.getOwnPropertySymbols(where.timestamp);
          if (gteSymbol) {
            return entry.timestamp >= where.timestamp[gteSymbol];
          }
        }

        return true;
      }).length;
    },
    async findAll({ order = [], limit = logs.length } = {}) {
      const sorted = [...logs].sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
      );

      return order.length > 0 ? sorted.slice(0, limit) : sorted.slice(0, limit);
    },
  };

  const SuspiciousObservation = {
    async findOne({ where }) {
      return observations.find((entry) => entry.userId === where.userId) ?? null;
    },
    async create(entry) {
      const record = {
        id: `obs-${observations.length + 1}`,
        ...entry,
        async update(values) {
          Object.assign(this, values);
          return this;
        },
        toJSON() {
          return this;
        },
      };

      observations.push(record);
      return record;
    },
    async count({ where } = {}) {
      if (!where) {
        return observations.length;
      }

      return observations.filter((entry) => {
        if (where.status && entry.status !== where.status) {
          return false;
        }

        return true;
      }).length;
    },
    async findAll() {
      return [...observations];
    },
    async findByPk(id) {
      return observations.find((entry) => entry.id === id) ?? null;
    },
  };

  return { logs, observations, AuditLog, SuspiciousObservation };
};

describe("audit service", () => {
  it("records audit logs and promotes risky users to observation", async () => {
    const models = createFakeModels();
    const request = {
      method: "POST",
      originalUrl: "/graphql",
      url: "/graphql",
      body: {
        query: 'mutation DeleteStuff { deleteStuff(input: "union select") }',
      },
      query: {},
      headers: {},
      ip: "127.0.0.1",
      socket: { remoteAddress: "127.0.0.1" },
      auditActor: {
        userId: "8f5d1f6a-3a0d-4a23-bd5f-1d7f9a0a1111",
        userEmail: "admin@example.com",
        userName: "Administrator",
        roles: ["admin"],
        userGroup: "ADMIN",
      },
    };
    const response = { statusCode: 403 };

    await recordAuditEvent(models, request, response);

    expect(models.logs).toHaveLength(1);
    expect(models.logs[0].entrySummary).toContain("ADMIN");
    expect(models.observations).toHaveLength(1);
    expect(models.observations[0].status).toBe("observed");

    const dashboard = await getSecurityDashboard(models, 10);
    expect(dashboard.summary.totalLogs).toBe(1);
    expect(dashboard.summary.activeObservations).toBe(1);
    expect(dashboard.observations).toHaveLength(1);
  });

  it("can clear an observation", async () => {
    const models = createFakeModels();
    const request = {
      method: "POST",
      originalUrl: "/graphql",
      url: "/graphql",
      body: {
        query: 'mutation DropTable { deleteStuff(input: "drop table users") }',
      },
      query: {},
      headers: {},
      auditActor: {
        userId: "8f5d1f6a-3a0d-4a23-bd5f-1d7f9a0a2222",
        userEmail: "user@example.com",
        userName: "Normal User",
        roles: ["user"],
        userGroup: "USER",
      },
    };

    await recordAuditEvent(models, request, { statusCode: 403 });
    const createdObservation = models.observations[0];
    expect(createdObservation).toBeDefined();

    const resolved = await resolveObservation(models, createdObservation.id);
    expect(resolved.status).toBe("cleared");
  });
});