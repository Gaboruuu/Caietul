import { createApp } from "./app.js";
import { createServer } from "node:http";

const port = Number(process.env.PORT || 3001);

const app = createApp();
const server = createServer(app);

// Set up WebSocket server
app.setupWebSocket(server);

server.listen(port, () => {
  console.log(`Express API listening on http://127.0.0.1:${port}`);
  console.log(`WebSocket server ready at ws://127.0.0.1:${port}/ws`);
});
