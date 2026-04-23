import { readFileSync } from "node:fs";

const championsPath = new URL("../../src/data/champions.json", import.meta.url);

export const loadSeedChampions = () => {
  const raw = readFileSync(championsPath, "utf8");
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error("Seed champions must be an array.");
  }

  return parsed.map((champion) => ({ ...champion }));
};
