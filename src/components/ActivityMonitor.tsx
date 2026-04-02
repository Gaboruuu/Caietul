/**
 * Activity Monitor Component - Displays user activity and preferences
 */

import { useState } from "react";
import {
  getActivitySummary,
  getActivityLogData,
  clearActivityLog,
} from "../utils/activityTracker";
import { getPreferences, resetPreferences } from "../utils/preferencesManager";

import styles from "../styles/ActivityMonitor.module.css";

interface TabType {
  id: "summary" | "log" | "preferences";
  label: string;
}

const TABS: TabType[] = [
  { id: "summary", label: "Activity Summary" },
  { id: "log", label: "Activity Log" },
  { id: "preferences", label: "User Preferences" },
];

export default function ActivityMonitor() {
  const [activeTab, setActiveTab] = useState<"summary" | "log" | "preferences">(
    "summary",
  );
  const [activityData, setActivityData] = useState(() => getActivityLogData());
  const [preferencesData, setPreferencesData] = useState(() =>
    getPreferences(),
  );

  const summary = getActivitySummary();

  const handleRefresh = () => {
    setActivityData(getActivityLogData());
    setPreferencesData(getPreferences());
  };

  const handleClearActivity = () => {
    if (confirm("Are you sure you want to clear the activity log?")) {
      clearActivityLog();
      setActivityData(getActivityLogData());
    }
  };

  const handleResetPreferences = () => {
    if (
      confirm("Are you sure you want to reset all preferences to defaults?")
    ) {
      resetPreferences();
      setPreferencesData(getPreferences());
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>User Activity Monitor</h1>
        <button onClick={handleRefresh} className={styles.refreshBtn}>
          Refresh
        </button>
      </div>

      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {/* Summary Tab */}
        {activeTab === "summary" && (
          <div className={styles.section}>
            <h2>Session Summary</h2>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryCard}>
                <h3>Session Duration</h3>
                <p className={styles.value}>
                  {formatDuration(summary.sessionDuration)}
                </p>
              </div>
              <div className={styles.summaryCard}>
                <h3>Total Actions</h3>
                <p className={styles.value}>{summary.totalActions}</p>
              </div>
              <div className={styles.summaryCard}>
                <h3>Page Views</h3>
                <p className={styles.value}>{summary.totalPageViews}</p>
              </div>
              <div className={styles.summaryCard}>
                <h3>Session ID</h3>
                <p className={styles.value} style={{ fontSize: "0.85rem" }}>
                  {activityData.sessionId}
                </p>
              </div>
            </div>

            {summary.lastAction && (
              <div className={styles.lastAction}>
                <h3>Last Action</h3>
                <p>
                  <strong>{summary.lastAction.action}</strong> at{" "}
                  {formatTimestamp(summary.lastAction.timestamp)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Log Tab */}
        {activeTab === "log" && (
          <div className={styles.section}>
            <div className={styles.logHeader}>
              <h2>Activity Log</h2>
              <button
                onClick={handleClearActivity}
                className={styles.dangerBtn}
              >
                Clear Log
              </button>
            </div>

            {activityData.events.length === 0 ? (
              <p className={styles.empty}>No activities recorded yet</p>
            ) : (
              <div className={styles.logTable}>
                <table>
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Time</th>
                      <th>Page</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityData.events.map((event, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{event.action}</strong>
                        </td>
                        <td>{formatTimestamp(event.timestamp)}</td>
                        <td>{event.page || "-"}</td>
                        <td className={styles.details}>
                          {event.metadata
                            ? JSON.stringify(event.metadata, null, 2)
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === "preferences" && (
          <div className={styles.section}>
            <div className={styles.logHeader}>
              <h2>User Preferences</h2>
              <button
                onClick={handleResetPreferences}
                className={styles.dangerBtn}
              >
                Reset to Defaults
              </button>
            </div>

            <div className={styles.preferencesGrid}>
              {Object.entries(preferencesData).map(([key, value]) => (
                <div key={key} className={styles.preferenceItem}>
                  <label>{key}</label>
                  <code>
                    {typeof value === "object"
                      ? JSON.stringify(value, null, 2)
                      : String(value)}
                  </code>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
