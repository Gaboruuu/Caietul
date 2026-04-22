/**
 * Example Implementation of Offline Support
 * This file shows how to use the offline sync features in your components
 */

import { useEffect, useState } from "react";
import { useOfflineSync, useOnServerReconnect } from "../hooks/useOfflineSync";
import { OfflineError } from "../api/matchesApi";

/**
 * Example 1: Simple Offline Status Display
 */
export function OfflineStatusExample() {
  const { isOnline, isServerReachable, pendingOperations } = useOfflineSync();

  return (
    <div>
      <p>
        Status: {isOnline && isServerReachable ? "✅ Online" : "❌ Offline"}
      </p>
      {pendingOperations > 0 && (
        <p>{pendingOperations} changes waiting to sync</p>
      )}
    </div>
  );
}

/**
 * Example 2: Disable/Enable Actions Based on Connectivity
 */
export function ConditionalActionExample() {
  const { isOnline, isServerReachable } = useOfflineSync();
  const canSaveToServer = isOnline && isServerReachable;

  const handleSave = async () => {
    if (!canSaveToServer) {
      alert(
        "You're offline. Your changes will be saved locally and synced when online.",
      );
    }
    // Continue with save operation
  };

  return (
    <button onClick={handleSave} disabled={false}>
      {canSaveToServer ? "Save to Server" : "Save Offline"}
    </button>
  );
}

/**
 * Example 3: Handle Offline Errors in API Calls
 */
export async function handleOfflineAwareOperation() {
  try {
    // This would be your API call
    // const match = await createMatch(data);
  } catch (error) {
    if (error instanceof OfflineError) {
      // Operation was queued locally
      console.log("Operation queued offline:", error.message);
      console.log("Operation will be synced when online");
    } else {
      // Other errors (validation, server errors, etc.)
      console.error("API Error:", error);
    }
  }
}

/**
 * Example 4: React to Server Reconnection
 */
export function ServerReconnectionExample() {
  const [message, setMessage] = useState("");

  useOnServerReconnect(() => {
    setMessage("✅ Server reconnected! Syncing changes...");
    setTimeout(() => setMessage(""), 3000);
  });

  return <div>{message && <p>{message}</p>}</div>;
}

/**
 * Example 5: Manual Sync Button
 */
export function ManualSyncExample() {
  const { pendingOperations, isSyncing, manualSync } = useOfflineSync();

  if (pendingOperations === 0) return null;

  return (
    <button onClick={manualSync} disabled={isSyncing}>
      {isSyncing
        ? "Syncing..."
        : `Sync ${pendingOperations} change${pendingOperations !== 1 ? "s" : ""}`}
    </button>
  );
}

/**
 * Example 6: Complete Match Form with Offline Support
 */
export function OfflineAwareFormExample() {
  const { isOnline, isServerReachable, pendingOperations, isSyncing } =
    useOfflineSync();
  const [formData, setFormData] = useState({ champion: "", kills: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [tempId, setTempId] = useState<string | null>(null);

  const canSaveToServer = isOnline && isServerReachable;
  const statusIcon = canSaveToServer ? "✅" : "⏸️";
  const statusText = canSaveToServer
    ? "Ready to save"
    : "Will save when online";

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In real implementation, call your API here
      // const match = await createMatch(formData);
      // setTempId(match.id);

      alert(
        canSaveToServer
          ? "Saved to server!"
          : "Saved locally - will sync when online",
      );
    } catch (error) {
      if (error instanceof OfflineError) {
        alert("Saved offline - will sync when online");
      } else {
        alert("Error saving match");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form>
      <input
        type="text"
        placeholder="Champion"
        value={formData.champion}
        onChange={(e) => setFormData({ ...formData, champion: e.target.value })}
        disabled={isSaving}
      />

      <input
        type="number"
        placeholder="Kills"
        value={formData.kills}
        onChange={(e) =>
          setFormData({ ...formData, kills: parseInt(e.target.value) })
        }
        disabled={isSaving}
      />

      <div>
        <small>
          {statusIcon} {statusText}
          {tempId && ` (Temp ID: ${tempId})`}
          {pendingOperations > 0 && ` • ${pendingOperations} pending`}
        </small>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving || isSyncing}
      >
        {isSaving ? "Saving..." : "Save Match"}
      </button>
    </form>
  );
}

/**
 * Example 7: Listen to Sync Progress
 */
export function SyncProgressExample() {
  const { isSyncing, pendingOperations, lastSyncTime, errors } =
    useOfflineSync();

  const lastSyncDisplay = lastSyncTime
    ? new Date(lastSyncTime).toLocaleString()
    : "Never";

  return (
    <div>
      <h3>Sync Status</h3>
      <p>Syncing: {isSyncing ? "Yes" : "No"}</p>
      <p>Pending: {pendingOperations}</p>
      <p>Last Sync: {lastSyncDisplay}</p>

      {errors.length > 0 && (
        <div>
          <h4>Sync Errors:</h4>
          <ul>
            {errors.map((error) => (
              <li key={error.operationId}>{error.error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Example 8: Refresh Data on Reconnection
 */
export function RefreshDataOnReconnectExample() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useOnServerReconnect(async () => {
    setIsLoading(true);
    try {
      // Refetch data from server
      // const matches = await fetchAllMatches();
      // setData(matches);
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <div>
      {isLoading && <p>Refreshing data...</p>}
      <p>Data items: {data.length}</p>
    </div>
  );
}

/**
 * Example 9: Detect Offline vs Server Unreachable
 */
export function ConnectivityDetectionExample() {
  const { isOnline, isServerReachable } = useOfflineSync();

  let message = "";
  if (!isOnline) {
    message = "📵 No internet connection";
  } else if (!isServerReachable) {
    message = "🔌 Internet connected but server is down";
  } else {
    message = "✅ Everything is online";
  }

  return <p>{message}</p>;
}

/**
 * Example 10: Show Temporary IDs During Offline Create
 */
export function TemporaryIDExample() {
  const [matches, setMatches] = useState([
    { id: "match-1", champion: "Lux", kills: 5 },
  ]);

  const renderID = (id: string) => {
    if (id.startsWith("temp-")) {
      return (
        <span title="Temporary ID - will be updated after sync">
          {id} (⏳ pending)
        </span>
      );
    }
    return <span>{id}</span>;
  };

  return (
    <ul>
      {matches.map((match) => (
        <li key={match.id}>
          {match.champion} - ID: {renderID(match.id)}
        </li>
      ))}
    </ul>
  );
}
