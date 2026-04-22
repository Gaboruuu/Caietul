import { generateFakeMatchBatch } from "./fakeDataGenerator.js";

/**
 * Manages async data generation and WebSocket notifications
 */
export const createDataGenerationManager = () => {
  let generationLoop = null;
  let isGenerating = false;
  let wsClients = new Set();

  const notifyClients = (type, data) => {
    const message = JSON.stringify({ type, data, timestamp: Date.now() });

    wsClients.forEach((client) => {
      if (client.readyState === 1) {
        // WebSocket.OPEN
        client.send(message);
      } else {
        // Remove closed connections
        wsClients.delete(client);
      }
    });
  };

  const startGeneration = (store, options = {}) => {
    if (isGenerating) {
      return { success: false, message: "Generation already in progress" };
    }

    const {
      batchSize = 5,
      intervalMs = 3000, // 3 seconds between batches
    } = options;

    isGenerating = true;

    generationLoop = setInterval(() => {
      try {
        const batch = generateFakeMatchBatch(batchSize);

        // Add each match to the store
        const addedMatches = batch.map((matchData) => store.create(matchData));

        // Notify all connected WebSocket clients
        notifyClients("matches-batch", {
          batchId: `batch-${Date.now()}`,
          count: addedMatches.length,
          matches: addedMatches,
          timestamp: new Date().toISOString(),
        });

        console.log(
          `[DataGen] Generated and added ${addedMatches.length} matches`,
        );
      } catch (error) {
        console.error("[DataGen] Error generating matches:", error);
        notifyClients("error", {
          message: "Error generating matches",
          error: error.message,
        });
      }
    }, intervalMs);

    console.log(
      `[DataGen] Started generation: ${batchSize} matches every ${intervalMs}ms`,
    );

    return {
      success: true,
      message: "Data generation started",
      config: { batchSize, intervalMs },
    };
  };

  const stopGeneration = () => {
    if (!isGenerating) {
      return { success: false, message: "Generation is not running" };
    }

    clearInterval(generationLoop);
    isGenerating = false;
    generationLoop = null;

    notifyClients("generation-stopped", {
      timestamp: new Date().toISOString(),
    });

    console.log("[DataGen] Generation stopped");

    return { success: true, message: "Data generation stopped" };
  };

  const addClient = (ws) => {
    wsClients.add(ws);
    console.log(`[WS] Client connected. Total clients: ${wsClients.size}`);

    // Send current status to newly connected client
    notifyClients("generation-status", {
      isGenerating,
      connectedClients: wsClients.size,
    });

    // Handle client close
    ws.on("close", () => {
      wsClients.delete(ws);
      console.log(`[WS] Client disconnected. Total clients: ${wsClients.size}`);
    });

    ws.on("error", (error) => {
      console.error("[WS] Client error:", error.message);
      wsClients.delete(ws);
    });
  };

  const getStatus = () => ({
    isGenerating,
    connectedClients: wsClients.size,
  });

  return {
    startGeneration,
    stopGeneration,
    addClient,
    getStatus,
    notifyClients,
  };
};
