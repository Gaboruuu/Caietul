import { beforeEach, describe, expect, it } from "vitest";
import { createChampionStore } from "./championStore.js";
import { loadSeedChampions } from "../data/seedChampions.js";

const buildChampion = (overrides = {}) => ({
  name: "Test Champion",
  icon: "🧪",
  role: "Mid",
  ...overrides,
});

let store;

beforeEach(() => {
  store = createChampionStore(loadSeedChampions());
});

describe("createChampionStore", () => {
  it("lists the seeded champions", () => {
    expect(store.list().length).toBeGreaterThan(0);
  });

  it("creates, updates, and deletes champions in memory", () => {
    const created = store.create(buildChampion());
    expect(created?.name).toBe("Test Champion");
    expect(store.getByName("Test Champion")).toBeDefined();

    const updated = store.update(
      "Test Champion",
      buildChampion({ icon: "✅" }),
    );
    expect(updated?.icon).toBe("✅");

    expect(store.delete("Test Champion")).toBe(true);
    expect(store.getByName("Test Champion")).toBeUndefined();
  });

  it("returns null or false for unknown champions", () => {
    expect(store.update("missing", buildChampion())).toBeNull();
    expect(store.delete("missing")).toBe(false);
    expect(store.getByName("missing")).toBeUndefined();
  });

  it("prevents duplicate champion names", () => {
    const created = store.create(buildChampion());
    expect(created).not.toBeNull();
    expect(store.create(buildChampion())).toBeNull();
  });
});
