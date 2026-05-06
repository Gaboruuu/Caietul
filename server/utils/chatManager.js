import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

export const createChatManager = (opts = {}) => {
  const { filePath = "./server/data/chat.json" } = opts;

  // Ensure data folder exists
  const dir = filePath.replace(/\/[^/]+$/, "");
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (e) {
    // ignore
  }

  const adapter = new JSONFile(filePath);
  const db = new Low(adapter, { messages: [] });

  const wsClients = new Set();

  const ensureDb = async () => {
    await db.read();
    db.data = db.data || { messages: [] };
    await db.write();
  };

  const saveMessage = async (msg) => {
    await ensureDb();
    const entry = { id: uuidv4(), timestamp: Date.now(), ...msg };
    db.data.messages.push(entry);
    await db.write();
    return entry;
  };

  const getRecentMessages = async (limit = 100) => {
    await ensureDb();
    const msgs = db.data.messages.slice(-limit);
    return msgs;
  };

  const broadcast = (payload) => {
    const text = JSON.stringify(payload);
    // Snapshot before iterating so we can prune dead clients safely.
    const clients = Array.from(wsClients);
    for (const client of clients) {
      if (client.readyState === 1) {
        try {
          client.send(text);
        } catch (err) {
          console.error("[Chat] send failed", err);
          wsClients.delete(client);
        }
      } else {
        wsClients.delete(client);
      }
    }
  };

  const addClient = async (ws) => {
    wsClients.add(ws);

    ws.on("close", () => {
      wsClients.delete(ws);
    });
    ws.on("error", () => {
      wsClients.delete(ws);
    });

    // Send recent messages. Guard against the client disconnecting during
    // the async db read.
    try {
      const recent = await getRecentMessages(100);
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({ type: "chat-history", data: recent }));
      }
    } catch (err) {
      console.error("[Chat] failed to send chat-history", err);
    }
  };

  const handleMessage = async (ws, raw) => {
    let payload;
    try {
      payload = JSON.parse(raw.toString());
    } catch (err) {
      console.error("[Chat] invalid message", err);
      return;
    }

    if (payload?.type === "chat") {
      const msg = await saveMessage(payload.data);
      broadcast({ type: "chat", data: msg });
    } else if (payload?.type === "identify") {
      // identification message from client, optional
      ws._clientInfo = payload.data || {};
    }
  };

  return {
    addClient,
    handleMessage,
    broadcast,
    getRecentMessages,
  };
};
