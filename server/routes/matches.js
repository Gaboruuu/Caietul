import { Router } from "express";
import {
  matchValidationConfig,
  validateMatchInput,
  validatePaginationQuery,
} from "../validation/matchValidation.js";

const sendValidationError = (response, errors) =>
  response.status(400).json({ error: "Validation failed", details: errors });

export const createMatchesRouter = (store) => {
  const router = Router();

  router.get("/", (request, response) => {
    const pagination = validatePaginationQuery(request.query);
    if (!pagination.ok) {
      return sendValidationError(response, pagination.errors);
    }

    const pageData = store.paginate(pagination.page, pagination.pageSize);
    return response.json({
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: pageData.total,
      totalPages: pageData.totalPages,
      items: pageData.items,
    });
  });

  router.get("/:id", (request, response) => {
    const match = store.getById(request.params.id);
    if (!match) {
      return response.status(404).json({ error: "Match not found" });
    }

    return response.json(match);
  });

  router.post("/", (request, response) => {
    const errors = validateMatchInput(request.body);
    if (Object.keys(errors).length > 0) {
      return sendValidationError(response, errors);
    }

    const created = store.create(request.body);
    return response.status(201).json(created);
  });

  router.put("/:id", (request, response) => {
    const errors = validateMatchInput(request.body);
    if (Object.keys(errors).length > 0) {
      return sendValidationError(response, errors);
    }

    const updated = store.update(request.params.id, request.body);
    if (!updated) {
      return response.status(404).json({ error: "Match not found" });
    }

    return response.json(updated);
  });

  router.delete("/:id", (request, response) => {
    const removed = store.delete(request.params.id);
    if (!removed) {
      return response.status(404).json({ error: "Match not found" });
    }

    return response.status(204).send();
  });

  return router;
};

export { matchValidationConfig };
