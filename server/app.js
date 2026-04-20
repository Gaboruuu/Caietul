import express from "express";
import { createMatchStore } from "./store/matchStore.js";
import { createMatchesRouter } from "./routes/matches.js";

const jsonParseErrorHandler = (error, _request, response, next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return response.status(400).json({ error: "Invalid JSON payload" });
  }

  return next(error);
};

export const createApp = ({ store = createMatchStore() } = {}) => {
  const app = express();

  app.use(express.json());
  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok" });
  });
  app.use("/api/matches", createMatchesRouter(store));
  app.use((_request, response) => {
    response.status(404).json({ error: "Not found" });
  });
  app.use(jsonParseErrorHandler);

  return app;
};
