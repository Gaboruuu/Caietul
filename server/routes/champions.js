import { Router } from "express";
import { validateChampionInput } from "../validation/championValidation.js";

const sendValidationError = (response, errors) =>
  response.status(400).json({ error: "Validation failed", details: errors });

const normalizeName = (name) => name.trim().toLowerCase();

const toChampionResponse = (champion, matches) => {
  const championMatches = matches.filter(
    (match) =>
      match.champion.trim().toLowerCase() === normalizeName(champion.name),
  );
  const wins = championMatches.filter(
    (match) => match.result === "Victory",
  ).length;
  const losses = championMatches.filter(
    (match) => match.result === "Defeat",
  ).length;
  const total = championMatches.length;

  return {
    ...champion,
    matchesCount: total,
    wins,
    losses,
    winRate: total > 0 ? (wins / total) * 100 : 0,
  };
};

export const createChampionsRouter = (
  championStore,
  matchStore,
  dataGenerationManager = null,
) => {
  const router = Router();

  router.get("/", (_request, response) => {
    const matches = matchStore.list();
    return response.json(
      championStore
        .list()
        .map((champion) => toChampionResponse(champion, matches)),
    );
  });

  router.get("/:name", (request, response) => {
    const champion = championStore.getByName(request.params.name);
    if (!champion) {
      return response.status(404).json({ error: "Champion not found" });
    }

    return response.json(toChampionResponse(champion, matchStore.list()));
  });

  router.get("/:name/matches", (request, response) => {
    const champion = championStore.getByName(request.params.name);
    if (!champion) {
      return response.status(404).json({ error: "Champion not found" });
    }

    const matches = matchStore
      .list()
      .filter(
        (match) =>
          normalizeName(match.champion) === normalizeName(request.params.name),
      );

    return response.json({
      champion: champion.name,
      total: matches.length,
      items: matches,
    });
  });

  router.post("/", (request, response) => {
    const errors = validateChampionInput(request.body);
    if (Object.keys(errors).length > 0) {
      return sendValidationError(response, errors);
    }

    const created = championStore.create(request.body);
    if (!created) {
      return response.status(409).json({ error: "Champion already exists" });
    }

    return response
      .status(201)
      .json(toChampionResponse(created, matchStore.list()));
  });

  router.put("/:name", (request, response) => {
    const errors = validateChampionInput(request.body);
    if (Object.keys(errors).length > 0) {
      return sendValidationError(response, errors);
    }

    if (
      normalizeName(request.params.name) !== normalizeName(request.body.name)
    ) {
      return response
        .status(409)
        .json({ error: "Champion name cannot be changed" });
    }

    const updated = championStore.update(request.params.name, request.body);
    if (!updated) {
      return response.status(404).json({ error: "Champion not found" });
    }

    return response.json(toChampionResponse(updated, matchStore.list()));
  });

  router.delete("/:name", (request, response) => {
    const matches = matchStore
      .list()
      .filter(
        (match) =>
          normalizeName(match.champion) === normalizeName(request.params.name),
      );

    if (matches.length > 0) {
      return response.status(409).json({
        error: "Champion still has matches and cannot be deleted",
      });
    }

    const removed = championStore.delete(request.params.name);
    if (!removed) {
      return response.status(404).json({ error: "Champion not found" });
    }

    return response.status(204).send();
  });

  if (dataGenerationManager) {
    router.get("/generation/status", (_request, response) => {
      return response.json(dataGenerationManager.getStatus());
    });
  }

  return router;
};
