import express from "express";
import { WebSocketServer } from "ws";
import { graphql } from "graphql";
import { createMatchStore } from "./store/matchStore.js";
import { createChampionStore } from "./store/championStore.js";
import { createDataGenerationManager } from "./utils/dataGenerationManager.js";
import { createGraphQLSchema, createRootResolvers } from "./graphql/schema.js";
import { createMatchesRouter } from "./routes/matches.js";
import { createChampionsRouter } from "./routes/champions.js";

const jsonParseErrorHandler = (error, _request, response, next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return response.status(400).json({ error: "Invalid JSON payload" });
  }

  return next(error);
};

export const createApp = ({
  store = createMatchStore(),
  championStore = createChampionStore(),
} = {}) => {
  const app = express();
  const dataGenerationManager = createDataGenerationManager();
  const schema = createGraphQLSchema();
  const domainStore = { ...store, championStore };
  const rootValue = createRootResolvers(domainStore, dataGenerationManager);

  app.use(express.json());

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

  // WebSocket upgrade handler
  app.on("upgrade", (request, socket, head) => {
    if (request.url === "/ws") {
      const wss = new WebSocketServer({ noServer: true });
      wss.handleUpgrade(request, socket, head, (ws) => {
        dataGenerationManager.addClient(ws);
      });
    } else {
      socket.destroy();
    }
  });

  // Attach WebSocket setup for HTTP server
  app.setupWebSocket = (server) => {
    const wss = new WebSocketServer({ server, path: "/ws" });

    wss.on("connection", (ws) => {
      dataGenerationManager.addClient(ws);
    });

    return wss;
  };

  // Attach dataGenerationManager for access in index.js
  app.dataGenerationManager = dataGenerationManager;

  return app;
};
