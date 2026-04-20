import type { Match } from "../types/match";

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
  const data = await request<Match>("/matches", {
    method: "POST",
    body: JSON.stringify(match),
  });
  return data as Match;
};

export const updateMatch = async (
  id: string,
  match: Omit<Match, "id">,
): Promise<Match> => {
  const data = await request<Match>(`/matches/${id}`, {
    method: "PUT",
    body: JSON.stringify(match),
  });
  return data as Match;
};

export const deleteMatch = async (id: string): Promise<void> => {
  await request(`/matches/${id}`, {
    method: "DELETE",
  });
};
