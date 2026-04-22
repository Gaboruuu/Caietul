import type { Match } from "../types/match";
import {
  isNetworkOnline,
  checkServerConnectivity,
} from "../utils/networkConnectivity";
import { queueOperation, type SyncOperation } from "../utils/syncQueue";

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

const request = async <T>(
  path: string,
  init?: RequestInit,
): Promise<T | null> => {
  try {
    const response = await fetch(`/api${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      ...init,
    });

    const payload = await parseJson<ApiErrorPayload | T>(response);

    if (!response.ok) {
      const apiPayload = payload as ApiErrorPayload | null;
      const message =
        apiPayload?.error ?? `Request failed with ${response.status}`;

      if (response.status === 400 && apiPayload?.details) {
        throw new ApiValidationError(message, apiPayload.details);
      }

      throw new Error(message);
    }

    return payload as T | null;
  } catch (error) {
    // Check if this is a network/connectivity error
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

    // Re-throw the original error if it's not a network error
    throw error;
  }
};

export const fetchMatchesPage = async (
  page: number,
  pageSize: number,
): Promise<PaginatedMatches> => {
  const data = await request<PaginatedMatches>(
    `/matches?page=${page}&pageSize=${pageSize}`,
  );
  return data as PaginatedMatches;
};

export const fetchAllMatches = async (): Promise<Match[]> => {
  const page = await fetchMatchesPage(1, 100);
  return page.items;
};

export const fetchMatchById = async (id: string): Promise<Match> => {
  const data = await request<Match>(`/matches/${id}`);
  return data as Match;
};

export const createMatch = async (match: Omit<Match, "id">): Promise<Match> => {
  try {
    const data = await request<Match>("/matches", {
      method: "POST",
      body: JSON.stringify(match),
    });
    return data as Match;
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
    const data = await request<Match>(`/matches/${id}`, {
      method: "PUT",
      body: JSON.stringify(match),
    });
    return data as Match;
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
    await request(`/matches/${id}`, {
      method: "DELETE",
    });
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
