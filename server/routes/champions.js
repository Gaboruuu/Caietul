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

  router.get("/", async (_request, response) => {
    const matches = await matchStore.list();
    const champions = await championStore.list();
    return response.json(
      champions.map((champion) => toChampionResponse(champion, matches)),
    );
  });

  router.get("/:name", async (request, response) => {
    const champion = await championStore.getByName(request.params.name);
    if (!champion) {
      return response.status(404).json({ error: "Champion not found" });
    }

    const matches = await matchStore.list();
    return response.json(toChampionResponse(champion, matches));
  });

  router.get("/:name/matches", async (request, response) => {
    const champion = await championStore.getByName(request.params.name);
    if (!champion) {
      return response.status(404).json({ error: "Champion not found" });
    }

    const matches = (await matchStore.list()).filter(
      (match) =>
        normalizeName(match.champion) === normalizeName(request.params.name),
    );

    return response.json({
      champion: champion.name,
      total: matches.length,
      items: matches,
    });
  });

  router.post("/", async (request, response) => {
    const errors = validateChampionInput(request.body);
    if (Object.keys(errors).length > 0) {
      return sendValidationError(response, errors);
    }

    const created = await championStore.create(request.body);
    if (!created) {
      return response.status(409).json({ error: "Champion already exists" });
    }

    return response
      .status(201)
      .json(toChampionResponse(created, await matchStore.list()));
  });

  router.put("/:name", async (request, response) => {
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

    const updated = await championStore.update(
      request.params.name,
      request.body,
    );
    if (!updated) {
      return response.status(404).json({ error: "Champion not found" });
    }

    return response.json(toChampionResponse(updated, await matchStore.list()));
  });

  router.delete("/:name", async (request, response) => {
    const matches = (await matchStore.list()).filter(
      (match) =>
        normalizeName(match.champion) === normalizeName(request.params.name),
    );

    if (matches.length > 0) {
      return response.status(409).json({
        error: "Champion still has matches and cannot be deleted",
      });
    }

    const removed = await championStore.delete(request.params.name);
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
