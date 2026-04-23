import { faker } from "@faker-js/faker";
import { loadSeedChampions } from "../data/seedChampions.js";

const ROLES = ["Top", "Jungle", "Mid", "Bot", "Support"];
const RESULTS = ["Victory", "Defeat", "Remake"];
const CHAMPIONS = loadSeedChampions();

/**
 * Generate a single fake match entity
 */
export const generateFakeMatch = () => {
  const durationSeconds = faker.number.int({ min: 60, max: 7200 });

  return {
    champion: faker.helpers.arrayElement(CHAMPIONS).name,
    role: faker.helpers.arrayElement(ROLES),
    result: faker.helpers.arrayElement(RESULTS),
    kills: faker.number.int({ min: 0, max: 99 }),
    deaths: faker.number.int({ min: 0, max: 99 }),
    assists: faker.number.int({ min: 0, max: 99 }),
    cs: faker.number.int({ min: 0, max: 1500 }),
    visionScore: faker.number.int({ min: 0, max: 300 }),
    duration: durationSeconds,
    date: faker.date.recent({ days: 30 }).toISOString().split("T")[0], // YYYY-MM-DD format
    patch: faker.helpers.arrayElement([
      "14.8",
      "14.9",
      "14.10",
      "14.11",
      "14.12",
      "14.13",
      "14.14",
      "14.15",
      "14.16",
    ]),
    notes: Math.random() > 0.7 ? faker.lorem.sentence() : "", // 30% chance of having notes
  };
};

/**
 * Generate a batch of fake matches
 */
export const generateFakeMatchBatch = (batchSize = 10) => {
  return Array.from({ length: batchSize }, () => generateFakeMatch());
};
