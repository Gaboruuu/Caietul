import { describe, expect, it } from "vitest";
import {
  matchValidationConfig,
  validateMatchInput,
  validatePaginationQuery,
} from "./matchValidation.js";

const sampleMatch = {
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
};

describe("validateMatchInput", () => {
  it("accepts a valid match", () => {
    expect(validateMatchInput(sampleMatch)).toEqual({});
  });

  it("rejects invalid role and result", () => {
    const errors = validateMatchInput({
      ...sampleMatch,
      role: "ADC",
      result: "Win",
    });
    expect(errors.role).toBeDefined();
    expect(errors.result).toBeDefined();
  });

  it("rejects malformed dates and patches", () => {
    const errors = validateMatchInput({
      ...sampleMatch,
      date: "not-a-date",
      patch: "25",
    });
    expect(errors.date).toBeDefined();
    expect(errors.patch).toBeDefined();
  });

  it("rejects out-of-range numeric values", () => {
    const errors = validateMatchInput({
      ...sampleMatch,
      duration: 30,
      cs: 5000,
    });
    expect(errors.duration).toBeDefined();
    expect(errors.cs).toBeDefined();
  });

  it("rejects a too-long champion name", () => {
    const errors = validateMatchInput({
      ...sampleMatch,
      champion: "A".repeat(31),
    });
    expect(errors.champion).toBeDefined();
  });
});

describe("validatePaginationQuery", () => {
  it("returns defaults when query is empty", () => {
    expect(validatePaginationQuery({})).toMatchObject({
      ok: true,
      page: 1,
      pageSize: 10,
    });
  });

  it("rejects invalid page and pageSize", () => {
    const result = validatePaginationQuery({ page: "0", pageSize: "-3" });
    expect(result.ok).toBe(false);
    expect(result.errors.page).toBeDefined();
    expect(result.errors.pageSize).toBeDefined();
  });

  it("rejects page sizes over the limit", () => {
    const result = validatePaginationQuery({ pageSize: "101" });
    expect(result.ok).toBe(false);
    expect(result.errors.pageSize).toContain("100");
  });
});

describe("matchValidationConfig", () => {
  it("exposes the enum configuration used by validation", () => {
    expect(matchValidationConfig.roles).toContain("Mid");
    expect(matchValidationConfig.results).toContain("Victory");
  });
});
