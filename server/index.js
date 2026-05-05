import { createApp } from "./app.js";
import { createServer } from "node:http";
import { initDb } from "./db/index.js";
import { createMatchStore } from "./store/matchStore.js";
import { createChampionStore } from "./store/championStore.js";

const port = Number(process.env.PORT || 3001);

// Initialize DB (if DATABASE_URL is provided)
const models = await initDb();

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
