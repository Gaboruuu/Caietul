import type { Match } from "../types/match";
import { loadMatches, saveMatches } from "./matchRepository";

// ── Helpers ──────────────────────────────────────────────────────────────────

export const generateId = (): string =>
  `match-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const calculateKda = (k: number, d: number, a: number): string => {
  if (d === 0) return "Perfect";
  return ((k + a) / d).toFixed(2);
};

// ── Validation ────────────────────────────────────────────────────────────────

export interface ValidationErrors {
  champion?: string;
  kills?: string;
  deaths?: string;
  assists?: string;
  cs?: string;
  visionScore?: string;
  duration?: string;
  date?: string;
  patch?: string;
}

const validateNumberInRange = (
  value: number | null | undefined,
  min: number,
  max: number,
  numberError: string,
  rangeError: string,
): string | undefined => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return numberError;
  }

  if (value < min || value > max) {
    return rangeError;
  }

  return undefined;
};

export const validateMatch = (data: Partial<Match>): ValidationErrors => {
  const errors: ValidationErrors = {};

  const setFieldError = (
    field: keyof ValidationErrors,
    message: string | undefined,
  ) => {
    if (message) {
      errors[field] = message;
    }
  };

  if (!data.champion || data.champion.trim().length === 0)
    errors.champion = "Champion name is required.";
  else if (data.champion.trim().length > 30)
    errors.champion = "Champion name must be 30 characters or fewer.";

  setFieldError(
    "kills",
    validateNumberInRange(
      data.kills,
      0,
      99,
      "Kills must be a number.",
      "Kills must be between 0 and 99.",
    ),
  );

  setFieldError(
    "deaths",
    validateNumberInRange(
      data.deaths,
      0,
      99,
      "Deaths must be a number.",
      "Deaths must be between 0 and 99.",
    ),
  );

  setFieldError(
    "assists",
    validateNumberInRange(
      data.assists,
      0,
      99,
      "Assists must be a number.",
      "Assists must be between 0 and 99.",
    ),
  );

  setFieldError(
    "cs",
    validateNumberInRange(
      data.cs,
      0,
      1500,
      "CS must be a number.",
      "CS must be between 0 and 1500.",
    ),
  );

  setFieldError(
    "visionScore",
    validateNumberInRange(
      data.visionScore,
      0,
      300,
      "Vision score must be a number.",
      "Vision score must be between 0 and 300.",
    ),
  );

  setFieldError(
    "duration",
    validateNumberInRange(
      data.duration,
      60,
      7200,
      "Duration must be a number.",
      "Duration must be between 1 and 120 minutes.",
    ),
  );

  if (!data.date || data.date.trim().length === 0)
    errors.date = "Date is required.";

  if (!data.patch || data.patch.trim().length === 0)
    errors.patch = "Patch is required.";
  else if (!/^\d+\.\d+$/.test(data.patch.trim()))
    errors.patch = "Patch must be in format e.g. 14.8";

  return errors;
};

export const isValid = (errors: ValidationErrors): boolean =>
  Object.keys(errors).length === 0;

// ── Store ─────────────────────────────────────────────────────────────────────

let matches: Match[] = loadMatches();

const persist = () => {
  matches = saveMatches(matches);
};

export const matchStore = {
  getAll(): Match[] {
    return [...matches].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  },

  getById(id: string): Match | undefined {
    return matches.find((m) => m.id === id);
  },

  add(data: Omit<Match, "id">): Match {
    const newMatch: Match = { ...data, id: generateId() };
    matches = [newMatch, ...matches];
    persist();
    return newMatch;
  },

  update(id: string, data: Omit<Match, "id">): Match | null {
    const index = matches.findIndex((m) => m.id === id);
    if (index === -1) return null;
    const updated: Match = { ...data, id };
    matches = matches.map((m) => (m.id === id ? updated : m));
    persist();
    return updated;
  },

  delete(id: string): boolean {
    const before = matches.length;
    matches = matches.filter((m) => m.id !== id);
    if (matches.length < before) {
      persist();
    }
    return matches.length < before;
  },

  getPage(
    page: number,
    pageSize: number,
  ): { items: Match[]; total: number; totalPages: number } {
    const all = matchStore.getAll();
    const total = all.length;
    const totalPages = Math.ceil(total / pageSize);
    const items = all.slice((page - 1) * pageSize, page * pageSize);
    return { items, total, totalPages };
  },
};
