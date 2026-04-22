/**
 * Example integration of WebSocket real-time updates with match list
 * This hook combines fetching initial data with WebSocket live updates
 */

import { useEffect, useState, useCallback } from "react";
import { useWebSocket, type MatchBatch } from "./useWebSocket";
import { fetchMatchesPage, type PaginatedMatches } from "../api/matchesApi";

export interface UseMatchListWithUpdatesOptions {
  pageSize?: number;
  initialPage?: number;
  autoRefreshOnBatch?: boolean;
}

export interface UseMatchListWithUpdatesResult extends PaginatedMatches {
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  refreshMatches: () => Promise<void>;
  wsConnected: boolean;
  lastBatchReceived: MatchBatch | null;
}

/**
 * Hook that combines paginated match fetching with WebSocket updates
 * When new matches arrive via WebSocket, it can automatically refresh the list
 */
export function useMatchListWithUpdates(
  options: UseMatchListWithUpdatesOptions = {},
): UseMatchListWithUpdatesResult {
  const { pageSize = 10, initialPage = 1, autoRefreshOnBatch = true } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageData, setPageData] = useState<PaginatedMatches>({
    page: 1,
    pageSize,
    total: 0,
    totalPages: 0,
    items: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastBatchReceived, setLastBatchReceived] = useState<MatchBatch | null>(
    null,
  );

  // WebSocket connection
  const {
    isConnected,
    latestBatch,
    error: wsError,
  } = useWebSocket(
    "",
    useCallback(
      (batch: MatchBatch) => {
        setLastBatchReceived(batch);

        // Auto-refresh matches if new batch received
        if (autoRefreshOnBatch) {
          // Only refresh if we're on the first page (newly added items appear there)
          if (currentPage === 1) {
            void refreshMatches();
          }
        }
      },
      [currentPage, autoRefreshOnBatch],
    ),
  );

  // Fetch matches from API
  const refreshMatches = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchMatchesPage(currentPage, pageSize);
      setPageData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load matches");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);

  // Initial load and reload on page change
  useEffect(() => {
    void refreshMatches();
  }, [refreshMatches]);

  return {
    ...pageData,
    isLoading,
    error: error || wsError,
    currentPage,
    setCurrentPage,
    refreshMatches,
    wsConnected: isConnected,
    lastBatchReceived: latestBatch || lastBatchReceived,
  };
}
