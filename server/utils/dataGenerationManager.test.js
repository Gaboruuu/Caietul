/**
 * Integration tests for WebSocket data generation
 * Run with: npm test -- server/utils/dataGenerationManager.test.js
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createDataGenerationManager } from "./dataGenerationManager.js";
import { createMatchStore } from "../store/matchStore.js";

describe("DataGenerationManager", () => {
  let manager;
  let store;

  beforeEach(() => {
    manager = createDataGenerationManager();
    store = createMatchStore();
  });

  afterEach(() => {
    // Clean up any running intervals
    if (manager) {
      manager.stopGeneration();
    }
  });

  describe("startGeneration", () => {
    it("should start generation successfully", () => {
      const result = manager.startGeneration(store, {
        batchSize: 5,
        intervalMs: 1000,
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("started");

      const status = manager.getStatus();
      expect(status.isGenerating).toBe(true);
    });

    it("should not start if already generating", () => {
      manager.startGeneration(store, { batchSize: 5, intervalMs: 1000 });
      const result = manager.startGeneration(store, {
        batchSize: 5,
        intervalMs: 1000,
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain("already in progress");
    });

    it("should generate matches periodically", async () => {
      const initialCount = store.list().length;

      manager.startGeneration(store, { batchSize: 3, intervalMs: 100 });

      // Wait for generation to happen
      await new Promise((resolve) => setTimeout(resolve, 250));

      const finalCount = store.list().length;

      expect(finalCount).toBeGreaterThan(initialCount);
      expect(finalCount - initialCount).toBeGreaterThanOrEqual(3);
    });
  });

  describe("stopGeneration", () => {
    it("should stop generation successfully", () => {
      manager.startGeneration(store, { batchSize: 5, intervalMs: 1000 });
      const result = manager.stopGeneration();

      expect(result.success).toBe(true);
      expect(result.message).toContain("stopped");

      const status = manager.getStatus();
      expect(status.isGenerating).toBe(false);
    });

    it("should not stop if not generating", () => {
      const result = manager.stopGeneration();

      expect(result.success).toBe(false);
      expect(result.message).toContain("not running");
    });

    it("should stop adding matches after stopGeneration", async () => {
      manager.startGeneration(store, { batchSize: 2, intervalMs: 100 });

      await new Promise((resolve) => setTimeout(resolve, 250));

      const countAfterStart = store.list().length;

      manager.stopGeneration();

      await new Promise((resolve) => setTimeout(resolve, 250));

      const countAfterStop = store.list().length;

      expect(countAfterStop).toBe(countAfterStart);
    });
  });

  describe("addClient", () => {
    it("should add a WebSocket client", () => {
      const mockWs = {
        readyState: 1,
        on: vi.fn(),
        send: vi.fn(),
      };

      manager.addClient(mockWs);
      const status = manager.getStatus();

      expect(status.connectedClients).toBe(1);
    });

    it("should handle multiple clients", () => {
      const mockWs1 = { readyState: 1, on: vi.fn(), send: vi.fn() };
      const mockWs2 = { readyState: 1, on: vi.fn(), send: vi.fn() };

      manager.addClient(mockWs1);
      manager.addClient(mockWs2);

      const status = manager.getStatus();
      expect(status.connectedClients).toBe(2);
    });
  });

  describe("notifyClients", () => {
    it("should send message to all connected clients", () => {
      const mockWs1 = {
        readyState: 1,
        on: vi.fn(),
        send: vi.fn(),
      };
      const mockWs2 = {
        readyState: 1,
        on: vi.fn(),
        send: vi.fn(),
      };

      manager.addClient(mockWs1);
      manager.addClient(mockWs2);

      manager.notifyClients("test-type", { data: "test" });

      expect(mockWs1.send).toHaveBeenCalled();
      expect(mockWs2.send).toHaveBeenCalled();
    });

    it("should skip closed connections", () => {
      const mockWs1 = {
        readyState: 1,
        on: vi.fn(),
        send: vi.fn(),
      };
      const mockWs2 = {
        readyState: 3, // CLOSED
        on: vi.fn(),
        send: vi.fn(),
      };

      manager.addClient(mockWs1);
      manager.addClient(mockWs2);

      manager.notifyClients("test-type", { data: "test" });

      expect(mockWs1.send).toHaveBeenCalled();
      expect(mockWs2.send).not.toHaveBeenCalled();
    });
  });

  describe("getStatus", () => {
    it("should return current status", () => {
      const mockWs = {
        readyState: 1,
        on: vi.fn(),
        send: vi.fn(),
      };

      manager.addClient(mockWs);
      manager.startGeneration(store, { batchSize: 5, intervalMs: 1000 });

      const status = manager.getStatus();

      expect(status).toEqual({
        isGenerating: true,
        connectedClients: 1,
      });
    });
  });
});
