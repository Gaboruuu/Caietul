/**
 * Component to control fake data generation
 * Allows starting/stopping the generation loop and displays current status
 */

import React, { useState, useCallback, useEffect } from "react";
import {
  useDataGenerationControl,
  useWebSocket,
  type DataGeneration,
  type MatchBatch,
} from "../hooks/useWebSocket";
import styles from "../styles/DataGenerationControl.module.css";

interface DataGenerationControlProps {
  onNewMatchesReceived?: (batch: MatchBatch) => void;
  className?: string;
}

export const DataGenerationControl: React.FC<DataGenerationControlProps> = ({
  onNewMatchesReceived,
  className,
}) => {
  const { startGeneration, stopGeneration, isLoading, error } =
    useDataGenerationControl();
  const {
    isConnected,
    generationStatus,
    error: wsError,
  } = useWebSocket("", onNewMatchesReceived);

  const [batchSize, setBatchSize] = useState(5);
  const [intervalMs, setIntervalMs] = useState(3000);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleStart = useCallback(async () => {
    setLocalError(null);

    try {
      await startGeneration(batchSize, intervalMs);
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "Failed to start generation",
      );
    }
  }, [startGeneration, batchSize, intervalMs]);

  const handleStop = useCallback(async () => {
    setLocalError(null);

    try {
      await stopGeneration();
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "Failed to stop generation",
      );
    }
  }, [stopGeneration]);

  const displayError = localError || error || wsError;

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <div className={styles.header}>
        <h3>Fake Data Generation</h3>
        <div className={styles.statusIndicators}>
          <div className={styles.statusItem}>
            <span className={styles.label}>WebSocket:</span>
            <span
              className={`${styles.status} ${isConnected ? styles.connected : styles.disconnected}`}
            >
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>

          {generationStatus && (
            <>
              <div className={styles.statusItem}>
                <span className={styles.label}>Status:</span>
                <span
                  className={`${styles.status} ${generationStatus.isGenerating ? styles.active : styles.inactive}`}
                >
                  {generationStatus.isGenerating
                    ? "Generating"
                    : "Not Generating"}
                </span>
              </div>

              <div className={styles.statusItem}>
                <span className={styles.label}>Connected Clients:</span>
                <span className={styles.value}>
                  {generationStatus.connectedClients}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label htmlFor="batchSize">Batch Size:</label>
          <input
            id="batchSize"
            type="number"
            min="1"
            max="50"
            value={batchSize}
            onChange={(e) =>
              setBatchSize(Math.max(1, parseInt(e.target.value) || 5))
            }
            disabled={isLoading || (generationStatus?.isGenerating ?? false)}
            className={styles.input}
          />
        </div>

        <div className={styles.controlGroup}>
          <label htmlFor="interval">Interval (ms):</label>
          <input
            id="interval"
            type="number"
            min="500"
            max="30000"
            step="500"
            value={intervalMs}
            onChange={(e) =>
              setIntervalMs(Math.max(500, parseInt(e.target.value) || 3000))
            }
            disabled={isLoading || (generationStatus?.isGenerating ?? false)}
            className={styles.input}
          />
        </div>

        <button
          onClick={handleStart}
          disabled={
            isLoading ||
            !isConnected ||
            (generationStatus?.isGenerating ?? false)
          }
          className={`${styles.button} ${styles.startButton}`}
          title="Start generating fake matches"
        >
          {isLoading ? "Loading..." : "Start Generation"}
        </button>

        <button
          onClick={handleStop}
          disabled={
            isLoading ||
            !isConnected ||
            !(generationStatus?.isGenerating ?? false)
          }
          className={`${styles.button} ${styles.stopButton}`}
          title="Stop generating fake matches"
        >
          {isLoading ? "Loading..." : "Stop Generation"}
        </button>
      </div>

      {displayError && (
        <div className={styles.error}>
          <span className={styles.errorIcon}>⚠️</span>
          {displayError}
        </div>
      )}
    </div>
  );
};

export default DataGenerationControl;
