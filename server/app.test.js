import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
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

const runGraphQL = async ({ query, variables }) => {
  const response = await request(app)
    .post("/graphql")
    .send({ query, variables });
  expect(response.status).toBe(200);
  return response.body;
};

beforeEach(() => {
  store = createMatchStore(loadSeedMatches());
  app = createApp({ store });
});

afterEach(() => {
  app.dataGenerationManager.stopGeneration();
});

describe("GET /api/health", () => {
  it("returns ok", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});

describe("Matches generation endpoints", () => {
  it("starts, reports and stops generation over HTTP", async () => {
    const startResponse = await request(app)
      .post("/api/matches/generation/start")
      .send({ batchSize: 2, intervalMs: 10_000 });

    expect(startResponse.status).toBe(200);
    expect(startResponse.body.success).toBe(true);
    expect(startResponse.body.config.batchSize).toBe(2);

    const statusResponse = await request(app).get(
      "/api/matches/generation/status",
    );

    expect(statusResponse.status).toBe(200);
    expect(statusResponse.body.isGenerating).toBe(true);

    const stopResponse = await request(app)
      .post("/api/matches/generation/stop")
      .send();

    expect(stopResponse.status).toBe(200);
    expect(stopResponse.body.success).toBe(true);
  });
});

describe("GraphQL query: matches", () => {
  it("returns a paginated list", async () => {
    const body = await runGraphQL({
      query: `
        query Matches($page: Int, $pageSize: Int) {
          matches(page: $page, pageSize: $pageSize) {
            page
            pageSize
            total
            items { id champion }
          }
        }
      `,
      variables: { page: 1, pageSize: 5 },
    });

    expect(body.errors).toBeUndefined();
    expect(body.data.matches.items).toHaveLength(5);
    expect(body.data.matches.page).toBe(1);
    expect(body.data.matches.pageSize).toBe(5);
    expect(body.data.matches.total).toBeGreaterThan(5);
  });

  it("rejects invalid pagination params", async () => {
    const body = await runGraphQL({
      query: `
        query Matches($page: Int, $pageSize: Int) {
          matches(page: $page, pageSize: $pageSize) {
            page
          }
        }
      `,
      variables: { page: 0, pageSize: 101 },
    });

    expect(body.errors).toBeDefined();
    expect(body.errors[0].message).toBe("Validation failed");
    expect(body.errors[0].extensions.code).toBe("BAD_USER_INPUT");
    expect(body.errors[0].extensions.details.page).toBeDefined();
    expect(body.errors[0].extensions.details.pageSize).toBeDefined();
  });
});

describe("GraphQL query: match", () => {
  it("returns a single match", async () => {
    const existing = store.list()[0];
    const body = await runGraphQL({
      query: `
        query Match($id: ID!) {
          match(id: $id) {
            id
          }
        }
      `,
      variables: { id: existing.id },
    });

    expect(body.errors).toBeUndefined();
    expect(body.data.match.id).toBe(existing.id);
  });

  it("returns null for an unknown match", async () => {
    const body = await runGraphQL({
      query: `
        query Match($id: ID!) {
          match(id: $id) {
            id
          }
        }
      `,
      variables: { id: "missing" },
    });

    expect(body.errors).toBeUndefined();
    expect(body.data.match).toBeNull();
  });
});

describe("GraphQL mutation: createMatch", () => {
  it("creates a match", async () => {
    const body = await runGraphQL({
      query: `
        mutation CreateMatch($input: MatchInput!) {
          createMatch(input: $input) {
            id
          }
        }
      `,
      variables: { input: buildMatch() },
    });

    expect(body.errors).toBeUndefined();
    expect(body.data.createMatch.id).toMatch(/^match-/);
    expect(store.getById(body.data.createMatch.id)).toBeDefined();
  });

  it("rejects invalid data", async () => {
    const body = await runGraphQL({
      query: `
        mutation CreateMatch($input: MatchInput!) {
          createMatch(input: $input) {
            id
          }
        }
      `,
      variables: { input: buildMatch({ kills: -1 }) },
    });

    expect(body.errors).toBeDefined();
    expect(body.errors[0].extensions.details.kills).toBeDefined();
  });
});

describe("GraphQL mutation: updateMatch", () => {
  it("updates an existing match", async () => {
    const existing = store.list()[0];
    const body = await runGraphQL({
      query: `
        mutation UpdateMatch($id: ID!, $input: MatchInput!) {
          updateMatch(id: $id, input: $input) {
            kills
          }
        }
      `,
      variables: { id: existing.id, input: buildMatch({ kills: 17 }) },
    });

    expect(body.errors).toBeUndefined();
    expect(body.data.updateMatch.kills).toBe(17);
    expect(store.getById(existing.id)?.kills).toBe(17);
  });

  it("returns not found for an unknown match", async () => {
    const body = await runGraphQL({
      query: `
        mutation UpdateMatch($id: ID!, $input: MatchInput!) {
          updateMatch(id: $id, input: $input) {
            id
          }
        }
      `,
      variables: { id: "missing", input: buildMatch() },
    });

    expect(body.errors).toBeDefined();
    expect(body.errors[0].message).toBe("Match not found");
    expect(body.errors[0].extensions.code).toBe("NOT_FOUND");
  });
});

describe("GraphQL mutation: deleteMatch", () => {
  it("removes a match", async () => {
    const created = store.create(buildMatch());
    const body = await runGraphQL({
      query: `
        mutation DeleteMatch($id: ID!) {
          deleteMatch(id: $id) {
            success
          }
        }
      `,
      variables: { id: created.id },
    });

    expect(body.errors).toBeUndefined();
    expect(body.data.deleteMatch.success).toBe(true);
    expect(store.getById(created.id)).toBeUndefined();
  });

  it("returns not found for an unknown match", async () => {
    const body = await runGraphQL({
      query: `
        mutation DeleteMatch($id: ID!) {
          deleteMatch(id: $id) {
            success
          }
        }
      `,
      variables: { id: "missing" },
    });

    expect(body.errors).toBeDefined();
    expect(body.errors[0].extensions.code).toBe("NOT_FOUND");
  });
});

describe("GraphQL generation controls", () => {
  it("starts, reports and stops generation", async () => {
    const startBody = await runGraphQL({
      query: `
        mutation StartGeneration($batchSize: Int!, $intervalMs: Int!) {
          startGeneration(batchSize: $batchSize, intervalMs: $intervalMs) {
            success
            message
            config { batchSize intervalMs }
          }
        }
      `,
      variables: { batchSize: 2, intervalMs: 10_000 },
    });

    expect(startBody.errors).toBeUndefined();
    expect(startBody.data.startGeneration.success).toBe(true);
    expect(startBody.data.startGeneration.config.batchSize).toBe(2);

    const statusBody = await runGraphQL({
      query: `
        query {
          generationStatus {
            isGenerating
          }
        }
      `,
    });

    expect(statusBody.errors).toBeUndefined();
    expect(statusBody.data.generationStatus.isGenerating).toBe(true);

    const stopBody = await runGraphQL({
      query: `
        mutation {
          stopGeneration {
            success
          }
        }
      `,
    });

    expect(stopBody.errors).toBeUndefined();
    expect(stopBody.data.stopGeneration.success).toBe(true);
  });
});
