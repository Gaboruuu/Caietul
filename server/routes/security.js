import express from "express";
import {
  getSecurityDashboard,
  resolveObservation,
} from "../utils/auditService.js";

const isAdminActor = (request) =>
  Array.isArray(request.auditActor?.roles) &&
  request.auditActor.roles.includes("admin");

const requireAdmin = (request, response, next) => {
  if (!request.auditActor) {
    return response.status(401).json({ error: "Authentication required" });
  }

  if (!isAdminActor(request)) {
    return response.status(403).json({ error: "Admin role required" });
  }

  return next();
};

export const createSecurityRouter = (models) => {
  const router = express.Router();

  router.use(requireAdmin);

  router.get("/dashboard", async (request, response) => {
    const rawLimit = Number(request.query.limit || 50);
    const limit = Number.isFinite(rawLimit)
      ? Math.max(5, Math.min(rawLimit, 200))
      : 50;

    const dashboard = await getSecurityDashboard(models, limit);
    return response.json(dashboard);
  });

  router.patch("/observations/:id/resolve", async (request, response) => {
    const observation = await resolveObservation(models, request.params.id);

    if (!observation) {
      return response.status(404).json({ error: "Observation not found" });
    }

    return response.json({ observation });
  });

  return router;
};