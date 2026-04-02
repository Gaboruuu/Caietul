/**
 * Activity Exporter - Export activity logs as JSON files
 */

import { getActivityLogData } from "../utils/activityTracker";
import { getPreferences } from "../utils/preferencesManager";
import styles from "../styles/ActivityExporter.module.css";

export function ActivityExporter() {
  const exportActivityAsJSON = () => {
    const activityLog = getActivityLogData();
    const preferences = getPreferences();

    const data = {
      exportedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      activityLog,
      preferences,
    };

    const jsonString = JSON.stringify(data, null, 2);
    downloadFile(jsonString, "activity-log.json", "application/json");
  };

  const exportActivityAsCSV = () => {
    const activityLog = getActivityLogData();

    // Convert events to CSV
    const headers = ["Action", "Timestamp", "Page", "Metadata"];
    const rows = activityLog.events.map((event) => [
      event.action,
      new Date(event.timestamp).toISOString(),
      event.page || "-",
      JSON.stringify(event.metadata || ""),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");

    downloadFile(csvContent, "activity-log.csv", "text/csv");
  };

  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string,
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <h3>📥 Export Activity Logs</h3>
      <p>Download your activity data in different formats:</p>

      <div className={styles.buttons}>
        <button onClick={exportActivityAsJSON} className={styles.jsonBtn}>
          📄 Export as JSON
        </button>
        <button onClick={exportActivityAsCSV} className={styles.csvBtn}>
          📊 Export as CSV
        </button>
      </div>

      <div className={styles.info}>
        <p className={styles.small}>
          Your data is stored locally in your browser cookies. When you export,
          it's downloaded to your computer for backup or analysis.
        </p>
      </div>
    </div>
  );
}
