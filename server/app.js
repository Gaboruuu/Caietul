import express from "express";
import { WebSocketServer } from "ws";
import { graphql } from "graphql";
import { createMatchStore } from "./store/matchStore.js";
import { createChampionStore } from "./store/championStore.js";
import { createDataGenerationManager } from "./utils/dataGenerationManager.js";
import { createChatManager } from "./utils/chatManager.js";
import {
  attachAuditActor,
  createAuditTrailMiddleware,
} from "./utils/auditService.js";
import { createGraphQLSchema, createRootResolvers } from "./graphql/schema.js";
import { createMatchesRouter } from "./routes/matches.js";
import { createChampionsRouter } from "./routes/champions.js";
import { createSecurityRouter } from "./routes/security.js";
import { createAuthRouter } from "./routes/auth.js";

const jsonParseErrorHandler = (error, _request, response, next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return response.status(400).json({ error: "Invalid JSON payload" });
  }

  return next(error);
};

export const createApp = ({
  store = createMatchStore(),
  championStore = createChampionStore(),
  models = null,
} = {}) => {
  const app = express();
  const dataGenerationManager = createDataGenerationManager();
  const schema = createGraphQLSchema();
  const domainStore = { ...store, championStore };
  const rootValue = createRootResolvers(domainStore, dataGenerationManager);

  app.use((request, response, next) => {
    const origin = request.headers.origin;

    response.setHeader("Access-Control-Allow-Origin", origin || "*");
    response.setHeader("Vary", "Origin");
    response.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD",
    );
    response.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );

    if (request.method === "OPTIONS") {
      return response.status(204).end();
    }

    return next();
  });

  app.use(express.json());
  app.use(attachAuditActor);

  if (models) {
    app.use(createAuditTrailMiddleware(models));
  }

  // Health check endpoint for connectivity detection
  // Responds to both GET and HEAD requests
  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok" });
  });
  app.head("/api/health", (_request, response) => {
    response.status(200).end();
  });

  app.use(
    "/api/matches",
    createMatchesRouter(domainStore, dataGenerationManager),
  );
  app.use(
    "/api/champions",
    createChampionsRouter(championStore, store, dataGenerationManager),
  );

  // Authentication routes (if models available)
  if (models) {
    app.use("/api/auth", createAuthRouter(models));
    app.use("/api/security", createSecurityRouter(models));
  }

  app.all("/graphql", async (request, response) => {
    const source =
      request.method === "GET" ? request.query?.query : request.body?.query;

    if (typeof source !== "string" || source.trim().length === 0) {
      return response.status(400).json({ error: "GraphQL query is required" });
    }

    let variableValues =
      request.method === "GET"
        ? request.query?.variables
        : request.body?.variables;

    if (typeof variableValues === "string") {
      try {
        variableValues = JSON.parse(variableValues);
      } catch {
        return response
          .status(400)
          .json({ error: "Invalid GraphQL variables" });
      }
    }

    const result = await graphql({
      schema,
      source,
      rootValue,
      variableValues,
    });

    return response.status(200).json(result);
  });

  app.use((_request, response) => {
    response.status(404).json({ error: "Not found" });
  });
  app.use(jsonParseErrorHandler);

  // Attach WebSocket setup for HTTP server
  app.setupWebSocket = (server) => {
    // Disable permessage-deflate to avoid some proxies/load-balancers
    // rejecting WebSocket upgrade requests that advertise this extension.
    const wss = new WebSocketServer({
      server,
      path: "/ws",
      perMessageDeflate: false,
    });

    // Create chat manager (persists chat to ./server/data/chat.json)
    const chatManager = createChatManager({
      filePath: "./server/data/chat.json",
    });

    wss.on("connection", (ws) => {
      // Add client to both managers
      dataGenerationManager.addClient(ws);
      chatManager.addClient(ws);

      ws.on("message", async (message) => {
        // Let chat manager handle chat messages
        try {
          await chatManager.handleMessage(ws, message);
        } catch (err) {
          console.error("[WS] message handling error", err);
        }
      });
    });

    return wss;
  };

  // Attach dataGenerationManager for access in index.js
  app.dataGenerationManager = dataGenerationManager;

  return app;
};
