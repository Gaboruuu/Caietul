/**
 * Example: Complete integration of fake data generation with UI
 * This demonstrates how to use the WebSocket hooks and components together
 */

import React, { useState, useCallback } from "react";
import DataGenerationControl from "../components/DataGenerationControl";
import { useMatchListWithUpdates } from "../hooks/useMatchListWithUpdates";
import { type MatchBatch } from "../hooks/useWebSocket";

/**
 * Demo page showing real-time match updates from WebSocket
 */
export default function DataGenerationDemoPage() {
  // Use the hook that combines API calls with WebSocket updates
  const {
    items: matches,
    page: currentPage,
    total: totalMatches,
    totalPages,
    isLoading,
    error,
    setCurrentPage,
    wsConnected,
    lastBatchReceived,
  } = useMatchListWithUpdates({
    pageSize: 10,
    autoRefreshOnBatch: true, // Auto-refresh page 1 when new matches arrive
  });

  // Track statistics
  const [stats, setStats] = useState({
    totalBatchesReceived: 0,
    totalMatchesGenerated: 0,
  });

  // Handle new batch received
  const handleNewBatch = useCallback((batch: MatchBatch) => {
    setStats((prev) => ({
      totalBatchesReceived: prev.totalBatchesReceived + 1,
      totalMatchesGenerated: prev.totalMatchesGenerated + batch.count,
    }));

    console.log(`📦 Batch received: ${batch.count} matches`);
    console.log(
      "  Matches:",
      batch.matches.map((m) => `${m.champion} (${m.role})`),
    );
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>🎮 Real-Time Match Data Generation Demo</h1>

      {/* Control panel for starting/stopping generation */}
      <DataGenerationControl
        onNewMatchesReceived={handleNewBatch}
        className="generation-control"
      />

      {/* Status Section */}
      <div
        style={{
          background: "#f5f5f5",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h3>📊 Statistics</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "15px",
          }}
        >
          <div>
            <div style={{ fontSize: "12px", color: "#666" }}>Total Matches</div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              {totalMatches}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              Batches Received
            </div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              {stats.totalBatchesReceived}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              Generated Matches
            </div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              {stats.totalMatchesGenerated}
            </div>
          </div>
        </div>

        {lastBatchReceived && (
          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              background: "white",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            <strong>Last Batch:</strong> {lastBatchReceived.count} matches at{" "}
            {new Date(lastBatchReceived.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div
          style={{
            background: "#fee",
            border: "1px solid #fcc",
            padding: "10px",
            borderRadius: "4px",
            marginBottom: "20px",
            color: "#c33",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Match List */}
      <div>
        <h3>📝 Match History</h3>

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
            Loading matches...
          </div>
        ) : matches.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
            No matches yet. Start generation to see matches appear here!
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f0f0f0",
                      borderBottom: "2px solid #ddd",
                    }}
                  >
                    <th style={{ padding: "10px", textAlign: "left" }}>
                      Champion
                    </th>
                    <th style={{ padding: "10px", textAlign: "left" }}>Role</th>
                    <th style={{ padding: "10px", textAlign: "center" }}>
                      Result
                    </th>
                    <th style={{ padding: "10px", textAlign: "center" }}>
                      K/D/A
                    </th>
                    <th style={{ padding: "10px", textAlign: "center" }}>CS</th>
                    <th style={{ padding: "10px", textAlign: "center" }}>
                      Vision
                    </th>
                    <th style={{ padding: "10px", textAlign: "center" }}>
                      Duration
                    </th>
                    <th style={{ padding: "10px", textAlign: "left" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match) => (
                    <tr
                      key={match.id}
                      style={{
                        borderBottom: "1px solid #eee",
                        background:
                          match.result === "Victory"
                            ? "#f0fff0"
                            : match.result === "Defeat"
                              ? "#fff0f0"
                              : "#fffef0",
                      }}
                    >
                      <td style={{ padding: "10px" }}>
                        <strong>{match.champion}</strong>
                      </td>
                      <td style={{ padding: "10px" }}>{match.role}</td>
                      <td
                        style={{
                          padding: "10px",
                          textAlign: "center",
                          fontWeight: "bold",
                          color:
                            match.result === "Victory"
                              ? "#4caf50"
                              : match.result === "Defeat"
                                ? "#f44336"
                                : "#ff9800",
                        }}
                      >
                        {match.result}
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          textAlign: "center",
                          fontFamily: "monospace",
                        }}
                      >
                        {match.kills}/{match.deaths}/{match.assists}
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          textAlign: "center",
                          fontFamily: "monospace",
                        }}
                      >
                        {match.cs}
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          textAlign: "center",
                          fontFamily: "monospace",
                        }}
                      >
                        {match.visionScore}
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          textAlign: "center",
                          fontFamily: "monospace",
                        }}
                      >
                        {Math.floor(match.duration / 60)}:
                        {String(match.duration % 60).padStart(2, "0")}
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          fontSize: "12px",
                          color: "#999",
                        }}
                      >
                        {match.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px",
                  marginTop: "20px",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: "8px 16px",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    opacity: currentPage === 1 ? 0.5 : 1,
                  }}
                >
                  ← Previous
                </button>

                <span>
                  Page <strong>{currentPage}</strong> of{" "}
                  <strong>{totalPages}</strong>
                </span>

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "8px 16px",
                    cursor:
                      currentPage === totalPages ? "not-allowed" : "pointer",
                    opacity: currentPage === totalPages ? 0.5 : 1,
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Info Section */}
      <div
        style={{
          marginTop: "30px",
          padding: "15px",
          background: "#e3f2fd",
          borderRadius: "4px",
          fontSize: "13px",
          lineHeight: "1.6",
        }}
      >
        <h4>ℹ️ How It Works</h4>
        <ul>
          <li>
            Use the <strong>Data Generation Control</strong> above to start/stop
            fake data generation
          </li>
          <li>
            Configure <strong>Batch Size</strong> (matches per batch) and{" "}
            <strong>Interval</strong> (milliseconds between batches)
          </li>
          <li>
            New matches are sent via <strong>WebSocket</strong> and
            automatically added to the server
          </li>
          <li>
            Page 1 automatically refreshes when new batches arrive to show the
            latest data
          </li>
          <li>
            Watch the <strong>Statistics</strong> section update in real-time
          </li>
        </ul>
      </div>
    </div>
  );
}
