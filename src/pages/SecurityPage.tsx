import { useEffect, useMemo, useState } from "react";
import { isAdmin } from "../utils/auth";
import {
  fetchSecurityDashboard,
  resolveSecurityObservation,
} from "../api/securityApi";
import type {
  SecurityDashboard,
  SecurityLog,
  SuspiciousObservation,
} from "../types/security";
import styles from "../styles/SecurityPage.module.css";

const formatTimestamp = (timestamp: string): string =>
  new Date(timestamp).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

export default function SecurityPage() {
  const [dashboard, setDashboard] = useState<SecurityDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResolvingId, setIsResolvingId] = useState<string | null>(null);

  const loadDashboard = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchSecurityDashboard(60);
      setDashboard(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load security dashboard",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const observedUsers = useMemo(
    () =>
      dashboard?.observations.filter((item) => item.status === "observed") ?? [],
    [dashboard],
  );

  const handleResolve = async (observation: SuspiciousObservation) => {
    setIsResolvingId(observation.id);

    try {
      await resolveSecurityObservation(observation.id);
      await loadDashboard();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to resolve observation",
      );
    } finally {
      setIsResolvingId(null);
    }
  };

  if (!isAdmin()) {
    return (
      <main className={styles.page}>
        <section className={styles.shell}>
          <div className={styles.heroCard}>
            <p className={styles.kicker}>Restricted</p>
            <h1>Security review is limited to admins.</h1>
            <p className={styles.heroText}>
              The observation list and audit trail are only available to users with the admin role.
            </p>
          </div>
        </section>
      </main>
    );
  }

  const summary = dashboard?.summary;
  const recentLogs = dashboard?.recentLogs ?? [];

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.heroCard}>
          <p className={styles.kicker}>Admin Security Console</p>
          <h1>Audit trail and observation list</h1>
          <p className={styles.heroText}>
            Every authenticated request is persisted, scored for risk, and surfaced here when the heuristic engine flags an account.
          </p>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Stored logs</span>
              <strong>{summary?.totalLogs ?? 0}</strong>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Observed users</span>
              <strong>{summary?.activeObservations ?? 0}</strong>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Highest risk</span>
              <strong>{summary?.highestRiskScore ?? 0}</strong>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Recent suspicious logs</span>
              <strong>{summary?.recentSuspiciousLogs ?? 0}</strong>
            </div>
          </div>
        </div>

        <div className={styles.dashboardGrid}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.panelKicker}>Observation list</p>
                <h2>Users under review</h2>
              </div>
              <button
                type="button"
                className={styles.refreshBtn}
                onClick={() => void loadDashboard()}
              >
                Refresh
              </button>
            </div>

            {observedUsers.length === 0 ? (
              <div className={styles.emptyState}>
                No active observations at the moment.
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Group</th>
                      <th>Risk</th>
                      <th>Seen</th>
                      <th>Reasons</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {observedUsers.map((observation) => (
                      <tr key={observation.id}>
                        <td>
                          <strong>{observation.userEmail}</strong>
                          <div className={styles.subtle}>{observation.userId}</div>
                        </td>
                        <td>{observation.userGroup}</td>
                        <td>
                          <span className={styles.riskBadge}>
                            {observation.riskScore}
                          </span>
                        </td>
                        <td>
                          {formatTimestamp(observation.lastSeenAt)}
                          <div className={styles.subtle}>
                            {observation.occurrenceCount} hits
                          </div>
                        </td>
                        <td className={styles.reasonCell}>
                          {observation.reasonSummary}
                        </td>
                        <td>
                          <button
                            type="button"
                            className={styles.resolveBtn}
                            onClick={() => void handleResolve(observation)}
                            disabled={isResolvingId === observation.id}
                          >
                            {isResolvingId === observation.id
                              ? "Resolving..."
                              : "Clear"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.panelKicker}>Audit log</p>
                <h2>Recent authenticated actions</h2>
              </div>
            </div>

            {recentLogs.length === 0 ? (
              <div className={styles.emptyState}>No audit entries were returned.</div>
            ) : (
              <div className={styles.logList}>
                {recentLogs.map((log: SecurityLog) => (
                  <article key={log.id} className={styles.logCard}>
                    <div className={styles.logTopRow}>
                      <div>
                        <strong>{log.userEmail || log.userId || "Anonymous"}</strong>
                        <div className={styles.subtle}>{log.entrySummary}</div>
                      </div>
                      <span className={styles.metaBadge}>{log.requestMethod}</span>
                    </div>
                    <div className={styles.logMeta}>
                      <span>{log.requestPath}</span>
                      <span>{formatTimestamp(log.timestamp)}</span>
                      <span>Status {log.statusCode}</span>
                      <span>Risk {log.riskScore}</span>
                    </div>
                    <div className={styles.logAction}>{log.actionInformation}</div>
                    {log.suspicionReasons.length > 0 && (
                      <div className={styles.reasonPills}>
                        {log.suspicionReasons.map((reason) => (
                          <span key={reason} className={styles.reasonPill}>
                            {reason}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}
        {isLoading && <div className={styles.loadingBanner}>Loading security data...</div>}
      </section>
    </main>
  );
}