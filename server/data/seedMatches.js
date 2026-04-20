import { readFileSync } from "node:fs";

const seedPath = new URL("../../src/data/matchSeed.json", import.meta.url);

export const loadSeedMatches = () => {
  const raw = readFileSync(seedPath, "utf8");
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error("Seed matches must be an array.");
  }

  return parsed.map((match) => ({ ...match }));
};
