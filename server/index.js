import { createApp } from "./app.js";
import { createServer } from "node:http";
import { initDb } from "./db/index.js";
import { createMatchStore } from "./store/matchStore.js";
import { createChampionStore } from "./store/championStore.js";
import { loadSeedChampions } from "./data/seedChampions.js";
import { loadSeedMatches } from "./data/seedMatches.js";

const port = Number(process.env.PORT || 3001);

// Initialize DB (if DATABASE_URL is provided)
const models = await initDb();

const seedDatabaseIfEmpty = async (dbModels) => {
  if (!dbModels?.Champion || !dbModels?.Match) {
    return;
  }

  const championCount = await dbModels.Champion.count();
  const matchCount = await dbModels.Match.count();

  if (championCount === 0) {
    const champions = loadSeedChampions().map((champion) => ({
      id: `champ-${champion.name.replace(/\s+/g, "-").toLowerCase()}`,
      ...champion,
    }));

    await dbModels.Champion.bulkCreate(champions, {
      ignoreDuplicates: true,
    });
  }

  if (matchCount === 0) {
    const championRows = await dbModels.Champion.findAll();
    const championIdByName = new Map(
      championRows.map((champion) => [champion.name, champion.id]),
    );

    const matches = loadSeedMatches().map((match) => {
      const championId = championIdByName.get(match.champion);
      if (!championId) {
        throw new Error(`Missing champion seed for ${match.champion}`);
      }

      return {
        ...match,
        championId,
      };
    });

    await dbModels.Match.bulkCreate(matches, {
      ignoreDuplicates: true,
    });
  }
};

await seedDatabaseIfEmpty(models);

const store = createMatchStore(models);
const championStore = createChampionStore(models);

const app = createApp({ store, championStore, models });
const server = createServer(app);

// Set up WebSocket server
app.setupWebSocket(server);

server.listen(port, "0.0.0.0", () => {
  console.log(`Express API listening on http://0.0.0.0:${port}`);
  console.log(`WebSocket server ready at ws://0.0.0.0:${port}/ws`);
});
