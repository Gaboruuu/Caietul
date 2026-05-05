import { GraphQLError, buildSchema } from "graphql";
import {
  matchValidationConfig,
  validateMatchInput,
  validatePaginationQuery,
} from "../validation/matchValidation.js";
import {
  championValidationConfig,
  validateChampionInput,
} from "../validation/championValidation.js";

const schema = buildSchema(`
  type Match {
    id: ID!
    champion: String!
    role: String!
    result: String!
    kills: Int!
    deaths: Int!
    assists: Int!
    cs: Int!
    visionScore: Int!
    duration: Int!
    date: String!
    patch: String!
    notes: String
  }

  type Champion {
    name: String!
    icon: String!
    role: String!
    matchesCount: Int!
    wins: Int!
    losses: Int!
    winRate: Float!
  }

  input MatchInput {
    champion: String!
    role: String!
    result: String!
    kills: Int!
    deaths: Int!
    assists: Int!
    cs: Int!
    visionScore: Int!
    duration: Int!
    date: String!
    patch: String!
    notes: String
  }

  input ChampionInput {
    name: String!
    icon: String!
    role: String!
  }

  type MatchesPage {
    page: Int!
    pageSize: Int!
    total: Int!
    totalPages: Int!
    items: [Match!]!
  }

  type MatchValidationConfig {
    roles: [String!]!
    results: [String!]!
    defaultPageSize: Int!
    maxPageSize: Int!
  }

  type GenerationConfig {
    batchSize: Int!
    intervalMs: Int!
  }

  type GenerationActionResult {
    success: Boolean!
    message: String!
    config: GenerationConfig
  }

  type GenerationStatus {
    isGenerating: Boolean!
    connectedClients: Int!
  }

  type DeleteMatchResult {
    success: Boolean!
  }

  type DeleteChampionResult {
    success: Boolean!
  }

  type Query {
    health: String!
    matchValidationConfig: MatchValidationConfig!
    championValidationConfig: ChampionValidationConfig!
    matches(page: Int, pageSize: Int): MatchesPage!
    match(id: ID!): Match
    champions: [Champion!]!
    champion(name: ID!): Champion
    championMatches(name: String!): [Match!]!
    generationStatus: GenerationStatus!
  }

  type Mutation {
    createMatch(input: MatchInput!): Match!
    updateMatch(id: ID!, input: MatchInput!): Match!
    deleteMatch(id: ID!): DeleteMatchResult!
    createChampion(input: ChampionInput!): Champion!
    updateChampion(name: ID!, input: ChampionInput!): Champion!
    deleteChampion(name: ID!): DeleteChampionResult!
    startGeneration(batchSize: Int = 5, intervalMs: Int = 3000): GenerationActionResult!
    stopGeneration: GenerationActionResult!
  }

  type ChampionValidationConfig {
    roles: [String!]!
  }
`);

const throwValidationError = (errors) => {
  throw new GraphQLError("Validation failed", {
    extensions: {
      code: "BAD_USER_INPUT",
      details: errors,
    },
  });
};

const throwNotFound = () => {
  throw new GraphQLError("Match not found", {
    extensions: {
      code: "NOT_FOUND",
    },
  });
};

const throwChampionNotFound = () => {
  throw new GraphQLError("Champion not found", {
    extensions: {
      code: "NOT_FOUND",
    },
  });
};

const throwConflict = (message) => {
  throw new GraphQLError(message, {
    extensions: {
      code: "CONFLICT",
    },
  });
};

const decorateChampion = (champion, matches) => {
  const championMatches = matches.filter(
    (match) =>
      match.champion.trim().toLowerCase() ===
      champion.name.trim().toLowerCase(),
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

export const createGraphQLSchema = () => schema;

export const createRootResolvers = (store, dataGenerationManager) => ({
  health() {
    return "ok";
  },

  matchValidationConfig() {
    return matchValidationConfig;
  },

  championValidationConfig() {
    return championValidationConfig;
  },

  async matches({ page, pageSize }) {
    const query = {};

    if (page !== undefined) {
      query.page = page;
    }

    if (pageSize !== undefined) {
      query.pageSize = pageSize;
    }

    const pagination = validatePaginationQuery(query);
    if (!pagination.ok) {
      throwValidationError(pagination.errors);
    }

    const pageData = await store.paginate(pagination.page, pagination.pageSize);

    return {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: pageData.total,
      totalPages: pageData.totalPages,
      items: pageData.items,
    };
  },

  async match({ id }) {
    return (await store.getById(id)) ?? null;
  },

  async champions() {
    const matches = await store.list();
    const champions = await store.championStore.list();
    return champions.map((champion) => decorateChampion(champion, matches));
  },

  async champion({ name }) {
    const champion = await store.championStore.getByName(name);
    if (!champion) {
      return null;
    }

    return decorateChampion(champion, await store.list());
  },

  async championMatches({ name }) {
    return (await store.list()).filter(
      (match) =>
        match.champion.trim().toLowerCase() === name.trim().toLowerCase(),
    );
  },

  generationStatus() {
    return dataGenerationManager.getStatus();
  },

  async createMatch({ input }) {
    if (!(await store.championStore.getByName(input.champion))) {
      throwValidationError({ champion: "Champion must exist." });
    }

    const errors = validateMatchInput(input);
    if (Object.keys(errors).length > 0) {
      throwValidationError(errors);
    }

    return await store.create(input);
  },

  async updateMatch({ id, input }) {
    if (!(await store.championStore.getByName(input.champion))) {
      throwValidationError({ champion: "Champion must exist." });
    }

    const errors = validateMatchInput(input);
    if (Object.keys(errors).length > 0) {
      throwValidationError(errors);
    }

    const updated = await store.update(id, input);
    if (!updated) {
      throwNotFound();
    }

    return updated;
  },

  async deleteMatch({ id }) {
    const removed = await store.delete(id);
    if (!removed) {
      throwNotFound();
    }

    return { success: true };
  },

  async createChampion({ input }) {
    const errors = validateChampionInput(input);
    if (Object.keys(errors).length > 0) {
      throwValidationError(errors);
    }

    const created = await store.championStore.create(input);
    if (!created) {
      throwConflict("Champion already exists");
    }

    return decorateChampion(created, await store.list());
  },

  async updateChampion({ name, input }) {
    const errors = validateChampionInput(input);
    if (Object.keys(errors).length > 0) {
      throwValidationError(errors);
    }

    if (name.trim().toLowerCase() !== input.name.trim().toLowerCase()) {
      throwConflict("Champion name cannot be changed");
    }

    const updated = await store.championStore.update(name, input);
    if (!updated) {
      throwChampionNotFound();
    }

    return decorateChampion(updated, await store.list());
  },

  async deleteChampion({ name }) {
    const matches = (await store.list()).filter(
      (match) =>
        match.champion.trim().toLowerCase() === name.trim().toLowerCase(),
    );

    if (matches.length > 0) {
      throwConflict("Champion still has matches and cannot be deleted");
    }

    const removed = await store.championStore.delete(name);
    if (!removed) {
      throwChampionNotFound();
    }

    return { success: true };
  },

  startGeneration({ batchSize = 5, intervalMs = 3000 }) {
    return dataGenerationManager.startGeneration(store, {
      batchSize: Number(batchSize),
      intervalMs: Number(intervalMs),
    });
  },

  stopGeneration() {
    return dataGenerationManager.stopGeneration();
  },
});
