/**
 * Offline Synchronization Manager
 * Handles retrying failed operations when connection is re-established
 */

import * as matchesApi from "../api/matchesApi";
import {
  getPendingOperations,
  removeOperation,
  incrementOperationRetry,
  type QueuedOperation,
} from "./syncQueue";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

let isSyncing = false;
let syncInProgress: Promise<void> | null = null;

/**
 * Synchronize all pending operations with the server
 */
export const syncPendingOperations = async (): Promise<{
  successful: number;
  failed: number;
  errors: Array<{ operationId: string; error: string }>;
}> => {
  // Prevent concurrent sync attempts
  if (isSyncing && syncInProgress) {
    return syncInProgress.then(() => ({
      successful: 0,
      failed: 0,
      errors: [],
    }));
  }

  isSyncing = true;
  const results = {
    successful: 0,
    failed: 0,
    errors: [] as Array<{ operationId: string; error: string }>,
  };

  syncInProgress = (async () => {
    try {
      const operations = getPendingOperations();

      for (const operation of operations) {
        // Skip operations that have exceeded max retries
        if (operation.retryCount >= MAX_RETRIES) {
          results.failed++;
          results.errors.push({
            operationId: operation.id,
            error: `Max retries exceeded (${MAX_RETRIES})`,
          });
          removeOperation(operation.id);
          continue;
        }

        try {
          await syncOperation(operation);
          removeOperation(operation.id);
          results.successful++;
        } catch (error) {
          incrementOperationRetry(operation.id);
          results.failed++;
          results.errors.push({
            operationId: operation.id,
            error: error instanceof Error ? error.message : String(error),
          });

          // Add delay between retries
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        }
      }
    } finally {
      isSyncing = false;
      syncInProgress = null;
    }
  })();

  return syncInProgress.then(() => results);
};

/**
 * Sync a single operation
 */
const syncOperation = async (operation: QueuedOperation): Promise<void> => {
  switch (operation.type) {
    case "CREATE": {
      await matchesApi.createMatch(operation.data);
      break;
    }
    case "UPDATE": {
      await matchesApi.updateMatch(operation.id, operation.data);
      break;
    }
    case "DELETE": {
      await matchesApi.deleteMatch(operation.id);
      break;
    }
    default:
      throw new Error(`Unknown operation type: ${(operation as any).type}`);
  }
};

/**
 * Check if sync is currently in progress
 */
export const isSyncInProgress = (): boolean => {
  return isSyncing;
};

/**
 * Manually trigger sync (useful for testing or explicit sync requests)
 */
export const triggerSync = async (): Promise<void> => {
  const result = await syncPendingOperations();
  if (result.errors.length > 0) {
    console.warn("Sync completed with errors:", result.errors);
  }
};
