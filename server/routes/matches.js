import { Router } from "express";
import {
  matchValidationConfig,
  validateMatchInput,
  validatePaginationQuery,
} from "../validation/matchValidation.js";

const sendValidationError = (response, errors) =>
  response.status(400).json({ error: "Validation failed", details: errors });

export const createMatchesRouter = (store, dataGenerationManager = null) => {
  const router = Router();

  router.get("/", async (request, response) => {
    const pagination = validatePaginationQuery(request.query);
    if (!pagination.ok) {
      return sendValidationError(response, pagination.errors);
    }

    const pageData = await store.paginate(pagination.page, pagination.pageSize);
    return response.json({
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: pageData.total,
      totalPages: pageData.totalPages,
      items: pageData.items,
    });
  });

  router.get("/:id", async (request, response) => {
    const match = await store.getById(request.params.id);
    if (!match) {
      return response.status(404).json({ error: "Match not found" });
    }

    return response.json(match);
  });

  router.post("/", async (request, response) => {
    if (!(await store.championStore.getByName(request.body?.champion))) {
      return response.status(400).json({
        error: "Validation failed",
        details: { champion: "Champion must exist." },
      });
    }

    const errors = validateMatchInput(request.body);
    if (Object.keys(errors).length > 0) {
      return sendValidationError(response, errors);
    }

    const created = await store.create(request.body);
    return response.status(201).json(created);
  });

  router.put("/:id", async (request, response) => {
    if (!(await store.championStore.getByName(request.body?.champion))) {
      return response.status(400).json({
        error: "Validation failed",
        details: { champion: "Champion must exist." },
      });
    }

    const errors = validateMatchInput(request.body);
    if (Object.keys(errors).length > 0) {
      return sendValidationError(response, errors);
    }

    const updated = await store.update(request.params.id, request.body);
    if (!updated) {
      return response.status(404).json({ error: "Match not found" });
    }

    return response.json(updated);
  });

  router.delete("/:id", async (request, response) => {
    const removed = await store.delete(request.params.id);
    if (!removed) {
      return response.status(404).json({ error: "Match not found" });
    }

    return response.status(204).send();
  });

  // Data generation endpoints
  if (dataGenerationManager) {
    router.post("/generation/start", (request, response) => {
      const { batchSize = 5, intervalMs = 3000 } = request.body;

      const result = dataGenerationManager.startGeneration(store, {
        batchSize: Number(batchSize),
        intervalMs: Number(intervalMs),
      });

      if (result.success) {
        return response.status(200).json(result);
      } else {
        return response.status(400).json(result);
      }
    });

    router.post("/generation/stop", (request, response) => {
      const result = dataGenerationManager.stopGeneration();

      if (result.success) {
        return response.status(200).json(result);
      } else {
        return response.status(400).json(result);
      }
    });

    router.get("/generation/status", (request, response) => {
      const status = dataGenerationManager.getStatus();
      return response.json(status);
    });
  }

  return router;
};

export { matchValidationConfig };
