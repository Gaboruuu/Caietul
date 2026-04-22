import { useOfflineSync } from "../hooks/useOfflineSync";
import styles from "../styles/OfflineIndicator.module.css";

/**
 * Offline Indicator Component
 * Shows network status and pending operations, with manual sync button
 */
export default function OfflineIndicator() {
  const {
    isOnline,
    isServerReachable,
    pendingOperations,
    isSyncing,
    lastSyncTime,
    manualSync,
  } = useOfflineSync();

  // Don't show anything if online and no pending operations
  if (isOnline && isServerReachable && pendingOperations === 0) {
    return null;
  }

  const isOffline = !isOnline || !isServerReachable;
  const statusText = !isOnline
    ? "Offline - No network connection"
    : !isServerReachable
      ? "Offline - Server unreachable"
      : pendingOperations > 0
        ? `${pendingOperations} pending operation${pendingOperations !== 1 ? "s" : ""}`
        : "Online";

  const lastSyncText = lastSyncTime
    ? new Date(lastSyncTime).toLocaleTimeString()
    : "Never";

  return (
    <div
      className={`${styles.indicator} ${isOffline ? styles.offline : styles.syncing}`}
    >
      <div className={styles.content}>
        <span className={styles.status}>{statusText}</span>
        {pendingOperations > 0 && (
          <>
            <span className={styles.separator}>•</span>
            <span className={styles.pending}>
              {isSyncing ? "Syncing..." : `Last sync: ${lastSyncText}`}
            </span>
          </>
        )}
      </div>
      {pendingOperations > 0 && !isSyncing && (
        <button
          className={styles.syncButton}
          onClick={() => manualSync()}
          title="Manually sync pending operations"
        >
          Sync Now
        </button>
      )}
      {isSyncing && (
        <div className={styles.syncingIndicator} title="Syncing operations...">
          <div className={styles.spinner} />
        </div>
      )}
    </div>
  );
}
