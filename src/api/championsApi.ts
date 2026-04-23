import type { Champion, ChampionInput } from "../types/champion";
import { ApiValidationError } from "./matchesApi";

type GraphQLErrorPayload = {
  message?: string;
  extensions?: {
    details?: Record<string, string>;
  };
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLErrorPayload[];
};

const parseJson = async <T>(response: Response): Promise<T | null> => {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  return JSON.parse(text) as T;
};

const graphqlRequest = async <T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> => {
  const response = await fetch("/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = (await parseJson<GraphQLResponse<T>>(response)) ?? {};

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  if (payload.errors && payload.errors.length > 0) {
    const firstError = payload.errors[0];
    const message = firstError.message ?? "GraphQL request failed";

    if (firstError.extensions?.details) {
      throw new ApiValidationError(message, firstError.extensions.details);
    }

    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error("GraphQL response did not include data");
  }

  return payload.data;
};

export const fetchChampions = async (): Promise<Champion[]> => {
  const data = await graphqlRequest<{ champions: Champion[] }>(`
    query Champions {
      champions {
        name
        icon
        role
        matchesCount
        wins
        losses
        winRate
      }
    }
  `);

  return data.champions;
};

export const createChampion = async (
  champion: ChampionInput,
): Promise<Champion> => {
  const data = await graphqlRequest<{ createChampion: Champion }>(
    `
      mutation CreateChampion($input: ChampionInput!) {
        createChampion(input: $input) {
          name
          icon
          role
          matchesCount
          wins
          losses
          winRate
        }
      }
    `,
    { input: champion },
  );

  return data.createChampion;
};

export const updateChampion = async (
  name: string,
  champion: ChampionInput,
): Promise<Champion> => {
  const data = await graphqlRequest<{ updateChampion: Champion }>(
    `
      mutation UpdateChampion($name: ID!, $input: ChampionInput!) {
        updateChampion(name: $name, input: $input) {
          name
          icon
          role
          matchesCount
          wins
          losses
          winRate
        }
      }
    `,
    { name, input: champion },
  );

  return data.updateChampion;
};

export const deleteChampion = async (name: string): Promise<void> => {
  const data = await graphqlRequest<{ deleteChampion: { success: boolean } }>(
    `
      mutation DeleteChampion($name: ID!) {
        deleteChampion(name: $name) {
          success
        }
      }
    `,
    { name },
  );

  if (!data.deleteChampion.success) {
    throw new Error("Failed to delete champion");
  }
};
