import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import { createMatchStore } from "./store/matchStore.js";
import { loadSeedMatches } from "./data/seedMatches.js";

const buildMatch = (overrides = {}) => ({
  champion: "Syndra",
  role: "Mid",
  result: "Victory",
  kills: 9,
  deaths: 2,
  assists: 7,
  cs: 287,
  visionScore: 34,
  duration: 1820,
  date: "2025-03-20T18:30:00Z",
  patch: "25.6",
  notes: "Great roam timing.",
  ...overrides,
});

let app;
let store;

beforeEach(() => {
  store = createMatchStore(loadSeedMatches());
  app = createApp({ store });
});

describe("GET /api/health", () => {
  it("returns ok", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});

describe("GET /api/matches", () => {
  it("returns a paginated list", async () => {
    const response = await request(app).get("/api/matches?page=1&pageSize=5");
    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(5);
    expect(response.body.page).toBe(1);
    expect(response.body.pageSize).toBe(5);
    expect(response.body.total).toBeGreaterThan(5);
  });

  it("rejects invalid pagination params", async () => {
    const response = await request(app).get("/api/matches?page=0&pageSize=101");
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Validation failed");
    expect(response.body.details.page).toBeDefined();
    expect(response.body.details.pageSize).toBeDefined();
  });
});

describe("GET /api/matches/:id", () => {
  it("returns a single match", async () => {
    const existing = store.list()[0];
    const response = await request(app).get(`/api/matches/${existing.id}`);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(existing.id);
  });

  it("returns 404 for an unknown match", async () => {
    const response = await request(app).get("/api/matches/missing");
    expect(response.status).toBe(404);
  });
});

describe("POST /api/matches", () => {
  it("creates a match", async () => {
    const response = await request(app).post("/api/matches").send(buildMatch());
    expect(response.status).toBe(201);
    expect(response.body.id).toMatch(/^match-/);
    expect(store.getById(response.body.id)).toBeDefined();
  });

  it("rejects invalid data", async () => {
    const response = await request(app)
      .post("/api/matches")
      .send(buildMatch({ kills: -1 }));
    expect(response.status).toBe(400);
    expect(response.body.details.kills).toBeDefined();
  });
});

describe("PUT /api/matches/:id", () => {
  it("updates an existing match", async () => {
    const existing = store.list()[0];
    const response = await request(app)
      .put(`/api/matches/${existing.id}`)
      .send(buildMatch({ kills: 17 }));

    expect(response.status).toBe(200);
    expect(response.body.kills).toBe(17);
    expect(store.getById(existing.id)?.kills).toBe(17);
  });

  it("returns 404 for an unknown match", async () => {
    const response = await request(app)
      .put("/api/matches/missing")
      .send(buildMatch());
    expect(response.status).toBe(404);
  });
});

describe("DELETE /api/matches/:id", () => {
  it("removes a match", async () => {
    const created = store.create(buildMatch());
    const response = await request(app).delete(`/api/matches/${created.id}`);
    expect(response.status).toBe(204);
    expect(store.getById(created.id)).toBeUndefined();
  });

  it("returns 404 for an unknown match", async () => {
    const response = await request(app).delete("/api/matches/missing");
    expect(response.status).toBe(404);
  });
});
