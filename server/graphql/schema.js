import { GraphQLError, buildSchema } from "graphql";
import {
  matchValidationConfig,
  validateMatchInput,
  validatePaginationQuery,
} from "../validation/matchValidation.js";

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

  type Query {
    health: String!
    matchValidationConfig: MatchValidationConfig!
    matches(page: Int, pageSize: Int): MatchesPage!
    match(id: ID!): Match
    generationStatus: GenerationStatus!
  }

  type Mutation {
    createMatch(input: MatchInput!): Match!
    updateMatch(id: ID!, input: MatchInput!): Match!
    deleteMatch(id: ID!): DeleteMatchResult!
    startGeneration(batchSize: Int = 5, intervalMs: Int = 3000): GenerationActionResult!
    stopGeneration: GenerationActionResult!
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

export const createGraphQLSchema = () => schema;

export const createRootResolvers = (store, dataGenerationManager) => ({
  health() {
    return "ok";
  },

  matchValidationConfig() {
    return matchValidationConfig;
  },

  matches({ page, pageSize }) {
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

    const pageData = store.paginate(pagination.page, pagination.pageSize);

    return {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: pageData.total,
      totalPages: pageData.totalPages,
      items: pageData.items,
    };
  },

  match({ id }) {
    return store.getById(id) ?? null;
  },

  generationStatus() {
    return dataGenerationManager.getStatus();
  },

  createMatch({ input }) {
    const errors = validateMatchInput(input);
    if (Object.keys(errors).length > 0) {
      throwValidationError(errors);
    }

    return store.create(input);
  },

  updateMatch({ id, input }) {
    const errors = validateMatchInput(input);
    if (Object.keys(errors).length > 0) {
      throwValidationError(errors);
    }

    const updated = store.update(id, input);
    if (!updated) {
      throwNotFound();
    }

    return updated;
  },

  deleteMatch({ id }) {
    const removed = store.delete(id);
    if (!removed) {
      throwNotFound();
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
