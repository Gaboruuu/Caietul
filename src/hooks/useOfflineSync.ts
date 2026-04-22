/**
 * useOfflineSync Hook
 * Provides offline synchronization status and manual sync trigger
 */

import { useEffect, useState, useCallback } from "react";
import {
  isNetworkOnline,
  onConnectivityChange,
  getConnectivityStatus,
  checkServerConnectivity,
} from "../utils/networkConnectivity";
import {
  getPendingOperationCount,
  onQueueChange,
  type QueuedOperation,
} from "../utils/syncQueue";
import { syncPendingOperations, isSyncInProgress } from "../utils/offlineSync";

export interface OfflineSyncStatus {
  isOnline: boolean;
  isServerReachable: boolean;
  pendingOperations: number;
  isSyncing: boolean;
  lastSyncTime: number | null;
  errors: Array<{ operationId: string; error: string }>;
}

/**
 * Hook to monitor offline sync status
 */
export const useOfflineSync = (): OfflineSyncStatus & {
  manualSync: () => Promise<void>;
} => {
  const [isOnline, setIsOnline] = useState(isNetworkOnline());
  const [isServerReachable, setIsServerReachable] = useState(true);
  const [pendingCount, setPendingCount] = useState(getPendingOperationCount());
  const [isSyncing, setIsSyncing] = useState(isSyncInProgress());
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [errors, setErrors] = useState<
    Array<{ operationId: string; error: string }>
  >([]);

  // Monitor connectivity changes
  useEffect(() => {
    const unsubscribe = onConnectivityChange((online) => {
      setIsOnline(online);
      if (online) {
        // Check server reachability when coming back online
        checkServerConnectivity().then(setIsServerReachable);
      }
    });

    return unsubscribe;
  }, []);

  // Monitor queue changes
  useEffect(() => {
    const unsubscribe = onQueueChange(() => {
      setPendingCount(getPendingOperationCount());
    });

    return unsubscribe;
  }, []);

  // Auto-sync when connection is re-established
  useEffect(() => {
    if (isOnline && isServerReachable && pendingCount > 0 && !isSyncing) {
      performSync();
    }
  }, [isOnline, isServerReachable, pendingCount, isSyncing]);

  const performSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      const result = await syncPendingOperations();
      setLastSyncTime(Date.now());
      setErrors(result.errors);
    } catch (error) {
      console.error("Sync error:", error);
      setErrors([
        {
          operationId: "unknown",
          error: error instanceof Error ? error.message : "Unknown sync error",
        },
      ]);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const manualSync = useCallback(async () => {
    await performSync();
  }, [performSync]);

  return {
    isOnline,
    isServerReachable,
    pendingOperations: pendingCount,
    isSyncing,
    lastSyncTime,
    errors,
    manualSync,
  };
};

/**
 * Hook to listen for server reconnection events
 */
export const useOnServerReconnect = (callback: () => void): void => {
  useEffect(() => {
    const handleReconnect = () => {
      callback();
    };

    window.addEventListener("server-reconnected", handleReconnect);
    return () => {
      window.removeEventListener("server-reconnected", handleReconnect);
    };
  }, [callback]);
};
