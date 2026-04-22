import type { Match } from "../types/match";
import {
  isNetworkOnline,
  checkServerConnectivity,
} from "../utils/networkConnectivity";
import { queueOperation } from "../utils/syncQueue";

export type PaginatedMatches = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  items: Match[];
};

type ApiErrorPayload = {
  error?: string;
  details?: Record<string, string>;
};

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

export class ApiValidationError extends Error {
  details: Record<string, string>;

  constructor(message: string, details: Record<string, string>) {
    super(message);
    this.name = "ApiValidationError";
    this.details = details;
  }
}

export class OfflineError extends Error {
  operationQueued: boolean;

  constructor(message: string, operationQueued: boolean = false) {
    super(message);
    this.name = "OfflineError";
    this.operationQueued = operationQueued;
  }
}

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

const runWithOfflineHandling = async <T>(operation: () => Promise<T>) => {
  try {
    return await operation();
  } catch (error) {
    const isNetworkError =
      error instanceof TypeError ||
      (error instanceof Error &&
        (error.message.includes("Failed to fetch") ||
          error.message.includes("NetworkError") ||
          error.message.includes("timeout")));

    if (isNetworkError) {
      const online = isNetworkOnline();
      if (!online) {
        throw new OfflineError("Device is offline", false);
      }

      const serverReachable = await checkServerConnectivity();
      if (!serverReachable) {
        throw new OfflineError("Server is unreachable", false);
      }
    }

    throw error;
  }
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
    const apiPayload = payload as unknown as ApiErrorPayload;
    throw new Error(
      apiPayload?.error ?? `Request failed with ${response.status}`,
    );
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

export const fetchMatchesPage = async (
  page: number,
  pageSize: number,
): Promise<PaginatedMatches> => {
  const data = await runWithOfflineHandling(() =>
    graphqlRequest<{ matches: PaginatedMatches }>(
      `
        query Matches($page: Int, $pageSize: Int) {
          matches(page: $page, pageSize: $pageSize) {
            page
            pageSize
            total
            totalPages
            items {
              id
              champion
              role
              result
              kills
              deaths
              assists
              cs
              visionScore
              duration
              date
              patch
              notes
            }
          }
        }
      `,
      { page, pageSize },
    ),
  );

  return data.matches;
};

export const fetchAllMatches = async (): Promise<Match[]> => {
  const page = await fetchMatchesPage(1, 100);
  return page.items;
};

export const fetchMatchById = async (id: string): Promise<Match> => {
  const data = await runWithOfflineHandling(() =>
    graphqlRequest<{ match: Match | null }>(
      `
        query Match($id: ID!) {
          match(id: $id) {
            id
            champion
            role
            result
            kills
            deaths
            assists
            cs
            visionScore
            duration
            date
            patch
            notes
          }
        }
      `,
      { id },
    ),
  );

  if (!data.match) {
    throw new Error("Match not found");
  }

  return data.match;
};

export const createMatch = async (match: Omit<Match, "id">): Promise<Match> => {
  try {
    const data = await runWithOfflineHandling(() =>
      graphqlRequest<{ createMatch: Match }>(
        `
          mutation CreateMatch($input: MatchInput!) {
            createMatch(input: $input) {
              id
              champion
              role
              result
              kills
              deaths
              assists
              cs
              visionScore
              duration
              date
              patch
              notes
            }
          }
        `,
        { input: match },
      ),
    );

    return data.createMatch;
  } catch (error) {
    if (error instanceof OfflineError) {
      // Generate a temporary ID for offline-created matches
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      // Queue the operation
      queueOperation({
        type: "CREATE",
        data: match,
        tempId,
      });

      // Return a temporary match object with the tempId
      return {
        ...match,
        id: tempId,
      };
    }
    throw error;
  }
};

export const updateMatch = async (
  id: string,
  match: Omit<Match, "id">,
): Promise<Match> => {
  try {
    const data = await runWithOfflineHandling(() =>
      graphqlRequest<{ updateMatch: Match }>(
        `
          mutation UpdateMatch($id: ID!, $input: MatchInput!) {
            updateMatch(id: $id, input: $input) {
              id
              champion
              role
              result
              kills
              deaths
              assists
              cs
              visionScore
              duration
              date
              patch
              notes
            }
          }
        `,
        { id, input: match },
      ),
    );

    return data.updateMatch;
  } catch (error) {
    if (error instanceof OfflineError) {
      // Queue the operation
      queueOperation({
        type: "UPDATE",
        id,
        data: match,
      });

      // Return the updated match
      return {
        ...match,
        id,
      };
    }
    throw error;
  }
};

export const deleteMatch = async (id: string): Promise<void> => {
  try {
    const data = await runWithOfflineHandling(() =>
      graphqlRequest<{ deleteMatch: { success: boolean } }>(
        `
          mutation DeleteMatch($id: ID!) {
            deleteMatch(id: $id) {
              success
            }
          }
        `,
        { id },
      ),
    );

    if (!data.deleteMatch.success) {
      throw new Error("Failed to delete match");
    }
  } catch (error) {
    if (error instanceof OfflineError) {
      // Queue the operation
      queueOperation({
        type: "DELETE",
        id,
      });
      return;
    }
    throw error;
  }
};
