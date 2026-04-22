/**
 * WebSocket hook for real-time data updates
 */

import { useEffect, useState, useCallback, useRef } from "react";

export interface DataGeneration {
  isGenerating: boolean;
  connectedClients: number;
}

export interface MatchBatch {
  batchId: string;
  count: number;
  matches: Array<{
    id: string;
    champion: string;
    role: string;
    result: string;
    kills: number;
    deaths: number;
    assists: number;
    cs: number;
    visionScore: number;
    duration: number;
    date: string;
    patch: string;
    notes?: string;
  }>;
  timestamp: string;
}

export interface WebSocketMessage {
  type: "matches-batch" | "generation-stopped" | "generation-status" | "error";
  data: unknown;
  timestamp: number;
}

export interface UseWebSocketResult {
  isConnected: boolean;
  latestBatch: MatchBatch | null;
  generationStatus: DataGeneration | null;
  error: string | null;
}

/**
 * Hook to connect to WebSocket and handle real-time updates
 * @param wsUrl - WebSocket URL (defaults to current host)
 * @param onBatchReceived - Callback when a new batch is received
 * @param onGenerationStatusChanged - Callback when generation status changes
 */
export function useWebSocket(
  wsUrl: string = "",
  onBatchReceived?: (batch: MatchBatch) => void,
  onGenerationStatusChanged?: (status: DataGeneration) => void,
): UseWebSocketResult {
  const [isConnected, setIsConnected] = useState(false);
  const [latestBatch, setLatestBatch] = useState<MatchBatch | null>(null);
  const [generationStatus, setGenerationStatus] =
    useState<DataGeneration | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    try {
      const url =
        wsUrl ||
        `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws`;

      console.log("[WebSocket] Connecting to:", url);
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log("[WebSocket] Connected");
        setIsConnected(true);
        setError(null);

        // Clear any pending reconnection timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;

          console.log("[WebSocket] Message received:", message.type);

          switch (message.type) {
            case "matches-batch": {
              const batch = message.data as MatchBatch;
              setLatestBatch(batch);
              onBatchReceived?.(batch);
              break;
            }

            case "generation-status": {
              const status = message.data as DataGeneration;
              setGenerationStatus(status);
              onGenerationStatusChanged?.(status);
              break;
            }

            case "generation-stopped": {
              setGenerationStatus((prev) =>
                prev ? { ...prev, isGenerating: false } : null,
              );
              onGenerationStatusChanged?.({
                isGenerating: false,
                connectedClients: generationStatus?.connectedClients || 0,
              });
              break;
            }

            case "error": {
              const errorMessage = (message.data as { message?: string })
                ?.message;
              setError(errorMessage || "Unknown error");
              console.error("[WebSocket] Server error:", errorMessage);
              break;
            }

            default:
              console.warn("[WebSocket] Unknown message type:", message.type);
          }
        } catch (parseError) {
          console.error("[WebSocket] Failed to parse message:", parseError);
          setError("Failed to parse server message");
        }
      };

      ws.onerror = (event) => {
        console.error("[WebSocket] Error:", event);
        setError("WebSocket connection error");
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log("[WebSocket] Disconnected");
        setIsConnected(false);
        wsRef.current = null;

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = window.setTimeout(() => {
          console.log("[WebSocket] Attempting to reconnect...");
          connect();
        }, 3000);
      };

      wsRef.current = ws;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("[WebSocket] Connection failed:", errorMessage);
      setError(errorMessage);
      setIsConnected(false);

      // Attempt to reconnect
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connect();
      }, 3000);
    }
  }, [wsUrl, onBatchReceived, onGenerationStatusChanged, generationStatus]);

  // Connect on mount
  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return {
    isConnected,
    latestBatch,
    generationStatus,
    error,
  };
}

/**
 * Hook to control data generation (start/stop)
 */
export interface UseDataGenerationControl {
  isLoading: boolean;
  error: string | null;
  startGeneration: (batchSize?: number, intervalMs?: number) => Promise<void>;
  stopGeneration: () => Promise<void>;
}

const invokeGraphQL = async <T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> => {
  const response = await fetch("/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  const payload = (await response.json()) as {
    data?: T;
    errors?: Array<{ message?: string }>;
  };

  if (payload.errors && payload.errors.length > 0) {
    throw new Error(payload.errors[0].message || "GraphQL request failed");
  }

  if (!payload.data) {
    throw new Error("GraphQL response did not include data");
  }

  return payload.data;
};

export function useDataGenerationControl(): UseDataGenerationControl {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startGeneration = useCallback(
    async (batchSize = 5, intervalMs = 3000) => {
      setIsLoading(true);
      setError(null);

      try {
        await invokeGraphQL<{ startGeneration: { success: boolean } }>(
          `
            mutation StartGeneration($batchSize: Int!, $intervalMs: Int!) {
              startGeneration(batchSize: $batchSize, intervalMs: $intervalMs) {
                success
              }
            }
          `,
          { batchSize, intervalMs },
        );

        console.log("[DataGen] Generation started");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const stopGeneration = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await invokeGraphQL<{ stopGeneration: { success: boolean } }>(
        `
          mutation StopGeneration {
            stopGeneration {
              success
            }
          }
        `,
      );

      console.log("[DataGen] Generation stopped");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    startGeneration,
    stopGeneration,
  };
}
