/**
 * Integration Guide - How to Use Offline Support in Existing Components
 *
 * This file shows practical examples of integrating offline support
 * into your existing components like MatchFormPage, MatchHomePage, etc.
 */

// =============================================================================
// EXAMPLE 1: MatchFormPage - Handle Offline Creates
// =============================================================================

/**
 * Before (without offline support):
 *
 * const handleSubmit = async (data) => {
 *   const match = await createMatch(data);
 *   navigate(`/matches/${match.id}`);
 * };
 *
 * Problem: Will crash if offline
 */

/**
 * After (with offline support):
 */
import { useOfflineSync } from "../hooks/useOfflineSync";

export function MatchFormPageWithOfflineSupport() {
  const { isOnline, isServerReachable, pendingOperations } = useOfflineSync();

  const handleSubmit = async (data) => {
    try {
      const match = await createMatch(data);
      // Works offline too! Returns temp ID if offline
      navigate(`/matches/${match.id}`);

      // Optional: Show user a notification if offline
      if (!isOnline || !isServerReachable) {
        showNotification("Saved offline - will sync when online", "info");
      }
    } catch (error) {
      if (error instanceof OfflineError) {
        // Should not happen with new error handling
        showNotification("Changes saved offline", "success");
      } else {
        showNotification("Error saving match", "error");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}

      {/* Show offline indicator in form */}
      {pendingOperations > 0 && (
        <p className="warning">⏳ {pendingOperations} unsaved changes</p>
      )}
    </form>
  );
}

// =============================================================================
// EXAMPLE 2: MatchHomePage - Show Sync Status
// =============================================================================

/**
 * Before: Just displays matches from server
 */

/**
 * After: Shows sync status while offline
 */
export function MatchHomePageWithOfflineSupport() {
  const { isOnline, isServerReachable, isSyncing, pendingOperations } =
    useOfflineSync();

  // Show warning banner if offline
  const shouldShowOfflineBanner = !isOnline || !isServerReachable;

  return (
    <div>
      {shouldShowOfflineBanner && (
        <div className="offline-banner">
          <p>
            {!isOnline
              ? "📵 You're offline - changes will sync when online"
              : "🔌 Server is unreachable"}
          </p>
        </div>
      )}

      {/* Your matches list */}

      {isSyncing && <p>🔄 Syncing {pendingOperations} changes...</p>}
    </div>
  );
}

// =============================================================================
// EXAMPLE 3: MatchDetailPage - Show Temporary IDs
// =============================================================================

/**
 * For matches created offline, the ID will be temp-* format
 * User should see a visual indicator that it's not yet synced
 */
export function MatchDetailPageWithOfflineSupport() {
  const { lastSyncTime } = useOfflineSync();
  const params = useParams();

  const isTempId = params.id?.startsWith("temp-");

  return (
    <div>
      {isTempId && (
        <div className="temp-id-warning">
          <p>⏳ This match is being synced... (Temporary ID)</p>
          {lastSyncTime && (
            <p>Last synced: {new Date(lastSyncTime).toLocaleString()}</p>
          )}
        </div>
      )}

      {/* Rest of match details */}
    </div>
  );
}

// =============================================================================
// EXAMPLE 4: Header/Navigation - Add Sync Status
// =============================================================================

/**
 * Show sync status in header for quick visibility
 */
export function HeaderWithSyncStatus() {
  const {
    isOnline,
    isServerReachable,
    pendingOperations,
    isSyncing,
    manualSync,
  } = useOfflineSync();

  const statusColor = isOnline && isServerReachable ? "green" : "red";
  const statusText =
    isOnline && isServerReachable
      ? "Online"
      : isOnline
        ? "Server Down"
        : "Offline";

  return (
    <header>
      {/* Your header content */}

      <div className="sync-status" style={{ color: statusColor }}>
        <span>● {statusText}</span>
        {pendingOperations > 0 && (
          <span>
            {" "}
            ({pendingOperations} pending
            {isSyncing ? "..." : ""})
          </span>
        )}
        {pendingOperations > 0 && !isSyncing && (
          <button onClick={manualSync}>Sync</button>
        )}
      </div>
    </header>
  );
}

// =============================================================================
// EXAMPLE 5: ListItem - Show Sync Status on Individual Items
// =============================================================================

/**
 * Show which items are pending sync
 */
export function MatchListItemWithSyncStatus({ match }) {
  const isTempId = match.id?.startsWith("temp-");

  return (
    <div className="match-item">
      <span>{match.champion}</span>
      <span>{match.kills}K</span>

      {isTempId && (
        <span className="temp-indicator" title="Pending sync">
          ⏳
        </span>
      )}
    </div>
  );
}

// =============================================================================
// EXAMPLE 6: Delete Confirmation - Handle Offline Deletes
// =============================================================================

/**
 * Before: Show immediate delete confirmation
 * After: Handle offline delete with queue
 */
export function DeleteConfirmPageWithOfflineSupport() {
  const { isOnline, isServerReachable } = useOfflineSync();

  const handleDelete = async () => {
    try {
      await deleteMatch(matchId);
      showNotification("Match deleted", "success");
      navigate("/matches");
    } catch (error) {
      showNotification("Error deleting match", "error");
    }
  };

  const isOffline = !isOnline || !isServerReachable;

  return (
    <div>
      <h2>Delete Match?</h2>
      <p>{isOffline ? "Will delete when online." : "This cannot be undone."}</p>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}

// =============================================================================
// EXAMPLE 7: Statistics Page - Show Data Freshness
// =============================================================================

/**
 * Show when last sync happened and if data might be stale
 */
export function StatisticsPageWithOfflineAwareness() {
  const { isOnline, isServerReachable, lastSyncTime, pendingOperations } =
    useOfflineSync();

  const dataIsFresh = isOnline && isServerReachable && pendingOperations === 0;

  return (
    <div>
      {!dataIsFresh && (
        <div className="stale-data-warning">
          <p>
            {!isOnline
              ? "📵 Offline - showing cached data"
              : !isServerReachable
                ? "🔌 Server unreachable - showing cached data"
                : "⏳ " +
                  pendingOperations +
                  " changes pending sync - data may be incomplete"}
          </p>
        </div>
      )}

      {lastSyncTime && (
        <p className="sync-info">
          Last updated: {new Date(lastSyncTime).toLocaleString()}
        </p>
      )}

      {/* Your statistics */}
    </div>
  );
}

// =============================================================================
// EXAMPLE 8: Modal Dialog - Confirm Before Sync
// =============================================================================

/**
 * Let user review pending changes before manual sync
 */
import { getPendingOperations } from "../utils/syncQueue";

export function SyncReviewDialog({ onClose }) {
  const pending = getPendingOperations();
  const { manualSync, isSyncing } = useOfflineSync();

  const createCount = pending.filter((op) => op.type === "CREATE").length;
  const updateCount = pending.filter((op) => op.type === "UPDATE").length;
  const deleteCount = pending.filter((op) => op.type === "DELETE").length;

  return (
    <dialog open>
      <h2>Review Pending Changes</h2>
      <ul>
        {createCount > 0 && <li>➕ {createCount} new matches</li>}
        {updateCount > 0 && <li>✏️ {updateCount} updated matches</li>}
        {deleteCount > 0 && <li>🗑️ {deleteCount} deleted matches</li>}
      </ul>
      <button
        onClick={() => {
          manualSync();
          onClose();
        }}
        disabled={isSyncing}
      >
        {isSyncing ? "Syncing..." : "Sync Now"}
      </button>
      <button onClick={onClose}>Cancel</button>
    </dialog>
  );
}

// =============================================================================
// INTEGRATION CHECKLIST
// =============================================================================

/**
 * Use this checklist when integrating offline support into components:
 *
 * ☐ Import useOfflineSync hook
 * ☐ Check isOnline/isServerReachable before critical operations
 * ☐ Handle temporary IDs for offline creates (id.startsWith("temp-"))
 * ☐ Show sync status to user (pending operations, sync in progress)
 * ☐ Provide manual sync button when pendingOperations > 0
 * ☐ Show appropriate offline message/warning to user
 * ☐ Update data display after sync (use useOnServerReconnect)
 * ☐ Test with browser DevTools offline mode
 * ☐ Test queue persistence (hard refresh while offline)
 * ☐ Test sync trigger (go back online and watch auto-sync)
 */

// =============================================================================
// STYLING TIPS
// =============================================================================

/**
 * CSS classes to style offline/sync states:
 *
 * .offline-banner {} - Show when offline
 * .temp-id-warning {} - Show for temp IDs
 * .sync-status {} - Header sync indicator
 * .temp-indicator {} - Visual indicator on items
 * .stale-data-warning {} - Data freshness warning
 * .pending { opacity: 0.6; } - Reduce opacity for pending items
 *
 * Example colors:
 * - Offline: #fee, border: #fcc, color: #c33
 * - Syncing: #fef3cd, border: #ffeaa7, color: #856404
 * - Synced: #d4edda, border: #c3e6cb, color: #155724
 */

// =============================================================================
// COMMON PATTERNS
// =============================================================================

/**
 * Pattern 1: Show pending count badge
 */
function PendingBadge() {
  const { pendingOperations } = useOfflineSync();
  if (pendingOperations === 0) return null;
  return <span className="badge">{pendingOperations}</span>;
}

/**
 * Pattern 2: Disable submit while syncing
 */
function FormWithSyncLock() {
  const { isSyncing } = useOfflineSync();
  return (
    <form>
      <button disabled={isSyncing}>{isSyncing ? "Saving..." : "Save"}</button>
    </form>
  );
}

/**
 * Pattern 3: Auto-refresh on reconnect
 */
function DataDisplayWithAutoRefresh() {
  const [data, setData] = useState([]);

  useOnServerReconnect(async () => {
    const freshData = await fetchAllMatches();
    setData(freshData);
  });

  return <div>{/* Display data */}</div>;
}

// =============================================================================
// EXPORT EXAMPLES
// =============================================================================

export const OfflineIntegrationExamples = {
  MatchFormPageWithOfflineSupport,
  MatchHomePageWithOfflineSupport,
  MatchDetailPageWithOfflineSupport,
  HeaderWithSyncStatus,
  MatchListItemWithSyncStatus,
  DeleteConfirmPageWithOfflineSupport,
  StatisticsPageWithOfflineAwareness,
  SyncReviewDialog,
  PendingBadge,
  FormWithSyncLock,
  DataDisplayWithAutoRefresh,
};
