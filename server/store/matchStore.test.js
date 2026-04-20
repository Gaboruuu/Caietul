import { beforeEach, describe, expect, it } from "vitest";
import { createMatchStore } from "./matchStore.js";
import { loadSeedMatches } from "../data/seedMatches.js";

const buildMatch = (overrides = {}) => ({
  champion: "Syndra",
  role: "Mid",
  result: "Victory",
  kills: 9,
  deaths: 2,
  assists: 7,
  cs: 287,
  visionScore: 34,
  duration: 1820,
  date: "2025-03-20T18:30:00Z",
  patch: "25.6",
  notes: "Great roam timing.",
  ...overrides,
});

let store;

beforeEach(() => {
  store = createMatchStore(loadSeedMatches());
});

describe("createMatchStore", () => {
  it("lists seed matches in descending date order", () => {
    const items = store.list();
    for (let index = 1; index < items.length; index += 1) {
      expect(new Date(items[index - 1].date).getTime()).toBeGreaterThanOrEqual(
        new Date(items[index].date).getTime(),
      );
    }
  });

  it("creates, updates, and deletes matches in memory", () => {
    const created = store.create(buildMatch());
    expect(store.getById(created.id)).toEqual(created);

    const updated = store.update(created.id, buildMatch({ kills: 15 }));
    expect(updated?.kills).toBe(15);
    expect(store.getById(created.id)?.kills).toBe(15);

    expect(store.delete(created.id)).toBe(true);
    expect(store.getById(created.id)).toBeUndefined();
  });

  it("returns null or false for unknown ids", () => {
    expect(store.update("missing", buildMatch())).toBeNull();
    expect(store.delete("missing")).toBe(false);
    expect(store.getById("missing")).toBeUndefined();
  });

  it("paginates results with totals", () => {
    const page = store.paginate(1, 5);
    expect(page.items.length).toBeLessThanOrEqual(5);
    expect(page.total).toBe(store.list().length);
    expect(page.totalPages).toBe(Math.ceil(page.total / 5));
  });

  it("returns an empty page when the requested page is past the end", () => {
    const page = store.paginate(999, 5);
    expect(page.items).toEqual([]);
  });
});
