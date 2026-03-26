import { describe, it, expect, beforeEach } from "vitest";
import {
  matchStore,
  validateMatch,
  isValid,
  calculateKda,
  formatDuration,
} from "../store/matchStore";
import type { Match } from "../types/match";

const sampleMatch: Omit<Match, "id"> = {
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
};

// Reset store state between tests by re-importing won't work with module state,
// so we track added IDs and clean them up manually.
let addedIds: string[] = [];

beforeEach(() => {
  addedIds.forEach((id) => matchStore.delete(id));
  addedIds = [];
});

// ── CRUD ──────────────────────────────────────────────────────────────────────

describe("matchStore.add", () => {
  it("adds a match and returns it with an id", () => {
    const m = matchStore.add(sampleMatch);
    addedIds.push(m.id);
    expect(m.id).toBeTruthy();
    expect(m.champion).toBe("Syndra");
  });

  it("new match appears in getAll()", () => {
    const m = matchStore.add(sampleMatch);
    addedIds.push(m.id);
    const all = matchStore.getAll();
    expect(all.find((x) => x.id === m.id)).toBeDefined();
  });
});

describe("matchStore.getById", () => {
  it("returns the correct match", () => {
    const m = matchStore.add(sampleMatch);
    addedIds.push(m.id);
    expect(matchStore.getById(m.id)?.champion).toBe("Syndra");
  });

  it("returns undefined for unknown id", () => {
    expect(matchStore.getById("nonexistent-id")).toBeUndefined();
  });
});

describe("matchStore.update", () => {
  it("updates an existing match", () => {
    const m = matchStore.add(sampleMatch);
    addedIds.push(m.id);
    const updated = matchStore.update(m.id, { ...sampleMatch, kills: 15 });
    expect(updated?.kills).toBe(15);
    expect(matchStore.getById(m.id)?.kills).toBe(15);
  });

  it("returns null for unknown id", () => {
    expect(matchStore.update("nonexistent-id", sampleMatch)).toBeNull();
  });
});

describe("matchStore.delete", () => {
  it("removes a match and returns true", () => {
    const m = matchStore.add(sampleMatch);
    const result = matchStore.delete(m.id);
    expect(result).toBe(true);
    expect(matchStore.getById(m.id)).toBeUndefined();
  });

  it("returns false for unknown id", () => {
    expect(matchStore.delete("nonexistent-id")).toBe(false);
  });
});

describe("matchStore.getPage", () => {
  it("returns correct page slice", () => {
    const all = matchStore.getAll();
    const page = matchStore.getPage(1, 5);
    expect(page.items.length).toBeLessThanOrEqual(5);
    expect(page.total).toBe(all.length);
  });

  it("calculates totalPages correctly", () => {
    const total = matchStore.getAll().length;
    const page = matchStore.getPage(1, 5);
    expect(page.totalPages).toBe(Math.ceil(total / 5));
  });

  it("returns sorted by date descending", () => {
    const page = matchStore.getPage(1, 50);
    for (let i = 1; i < page.items.length; i++) {
      expect(new Date(page.items[i - 1].date).getTime()).toBeGreaterThanOrEqual(
        new Date(page.items[i].date).getTime(),
      );
    }
  });
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("validateMatch", () => {
  it("passes with valid data", () => {
    expect(isValid(validateMatch(sampleMatch))).toBe(true);
  });

  it("fails when champion is empty", () => {
    const errors = validateMatch({ ...sampleMatch, champion: "" });
    expect(errors.champion).toBeDefined();
  });

  it("fails when champion is too long", () => {
    const errors = validateMatch({ ...sampleMatch, champion: "A".repeat(31) });
    expect(errors.champion).toBeDefined();
  });

  it("fails when kills is negative", () => {
    const errors = validateMatch({ ...sampleMatch, kills: -1 });
    expect(errors.kills).toBeDefined();
  });

  it("fails when deaths is over 99", () => {
    const errors = validateMatch({ ...sampleMatch, deaths: 100 });
    expect(errors.deaths).toBeDefined();
  });

  it("fails when cs is over 1500", () => {
    const errors = validateMatch({ ...sampleMatch, cs: 1501 });
    expect(errors.cs).toBeDefined();
  });

  it("fails when patch format is wrong", () => {
    const errors = validateMatch({ ...sampleMatch, patch: "patch14" });
    expect(errors.patch).toBeDefined();
  });

  it("passes with correct patch format", () => {
    const errors = validateMatch({ ...sampleMatch, patch: "14.8" });
    expect(errors.patch).toBeUndefined();
  });

  it("fails when date is missing", () => {
    const errors = validateMatch({ ...sampleMatch, date: "" });
    expect(errors.date).toBeDefined();
  });

  it("fails when duration is too short", () => {
    const errors = validateMatch({ ...sampleMatch, duration: 30 });
    expect(errors.duration).toBeDefined();
  });
});

// ── Helpers ───────────────────────────────────────────────────────────────────

describe("calculateKda", () => {
  it("returns Perfect when deaths is 0", () => {
    expect(calculateKda(5, 0, 3)).toBe("Perfect");
  });

  it("calculates correctly", () => {
    expect(calculateKda(9, 2, 7)).toBe("8.00");
  });
});

describe("formatDuration", () => {
  it("formats seconds into mm:ss", () => {
    expect(formatDuration(1820)).toBe("30:20");
  });

  it("pads seconds correctly", () => {
    expect(formatDuration(65)).toBe("1:05");
  });
});
