/**
 * Synchronization Queue
 * Manages pending operations that couldn't be synced due to offline status
 */

import type { Match } from "../types/match";

export type SyncOperation =
  | {
      type: "CREATE";
      data: Omit<Match, "id">;
      tempId: string;
    }
  | {
      type: "UPDATE";
      id: string;
      data: Omit<Match, "id">;
    }
  | {
      type: "DELETE";
      id: string;
    };

export type QueuedOperation = SyncOperation & {
  id: string;
  timestamp: number;
  retryCount: number;
};

export type SyncQueueListener = (queue: QueuedOperation[]) => void;

const STORAGE_KEY = "caietul.sync-queue.v1";
const listeners = new Set<SyncQueueListener>();

let operationQueue: QueuedOperation[] = [];

/**
 * Initialize queue from storage
 */
export const initializeSyncQueue = (): void => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      operationQueue = JSON.parse(stored);
    } catch (error) {
      console.error("Error loading sync queue:", error);
      operationQueue = [];
    }
  }
};

/**
 * Add an operation to the queue
 */
export const queueOperation = (operation: SyncOperation): string => {
  const id = `op-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const queued: QueuedOperation = {
    ...operation,
    id,
    timestamp: Date.now(),
    retryCount: 0,
  };

  operationQueue.push(queued);
  persistQueue();
  notifyListeners();

  return id;
};

/**
 * Get all pending operations
 */
export const getPendingOperations = (): QueuedOperation[] => {
  return [...operationQueue];
};

/**
 * Get operation count
 */
export const getPendingOperationCount = (): number => {
  return operationQueue.length;
};

/**
 * Remove operation from queue after successful sync
 */
export const removeOperation = (operationId: string): void => {
  operationQueue = operationQueue.filter((op) => op.id !== operationId);
  persistQueue();
  notifyListeners();
};

/**
 * Update retry count for an operation
 */
export const incrementOperationRetry = (operationId: string): void => {
  const operation = operationQueue.find((op) => op.id === operationId);
  if (operation) {
    operation.retryCount++;
    persistQueue();
    notifyListeners();
  }
};

/**
 * Clear all operations (use with caution)
 */
export const clearQueue = (): void => {
  operationQueue = [];
  localStorage.removeItem(STORAGE_KEY);
  notifyListeners();
};

/**
 * Subscribe to queue changes
 */
export const onQueueChange = (listener: SyncQueueListener): (() => void) => {
  listeners.add(listener);
  // Notify immediately with current state
  listener(operationQueue);
  return () => {
    listeners.delete(listener);
  };
};

/**
 * Persist queue to storage
 */
const persistQueue = (): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(operationQueue));
  } catch (error) {
    console.error("Error persisting sync queue:", error);
  }
};

/**
 * Notify all listeners of queue changes
 */
const notifyListeners = (): void => {
  listeners.forEach((listener) => {
    try {
      listener([...operationQueue]);
    } catch (error) {
      console.error("Error in queue listener:", error);
    }
  });
};
