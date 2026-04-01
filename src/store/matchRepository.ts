import type { Match } from "../types/match";
import seedMatches from "../data/matchSeed.json";

const STORAGE_KEY = "caietul.matches.v1";

let memoryFallback: string | null = null;

const hasLocalStorage = (): boolean => {
  return typeof globalThis !== "undefined" && "localStorage" in globalThis;
};

const readRaw = (): string | null => {
  if (hasLocalStorage()) {
    return globalThis.localStorage.getItem(STORAGE_KEY);
  }

  return memoryFallback;
};

const writeRaw = (value: string): void => {
  if (hasLocalStorage()) {
    globalThis.localStorage.setItem(STORAGE_KEY, value);
    return;
  }

  memoryFallback = value;
};

type PersistedPayload = {
  version: 1;
  items: Match[];
};

const isMatch = (value: unknown): value is Match => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<Match>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.champion === "string" &&
    typeof candidate.role === "string" &&
    typeof candidate.result === "string" &&
    typeof candidate.kills === "number" &&
    typeof candidate.deaths === "number" &&
    typeof candidate.assists === "number" &&
    typeof candidate.cs === "number" &&
    typeof candidate.visionScore === "number" &&
    typeof candidate.duration === "number" &&
    typeof candidate.date === "string" &&
    typeof candidate.patch === "string"
  );
};

const normalizeSeed = (): Match[] => {
  return (seedMatches as Match[]).map((match) => ({ ...match }));
};

const readPayload = (): PersistedPayload | null => {
  try {
    const raw = readRaw();
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<PersistedPayload>;
    if (parsed.version !== 1 || !Array.isArray(parsed.items)) {
      return null;
    }

    const validItems = parsed.items.filter(isMatch);
    return { version: 1, items: validItems };
  } catch {
    return null;
  }
};

const writePayload = (items: Match[]): void => {
  const payload: PersistedPayload = { version: 1, items };
  writeRaw(JSON.stringify(payload));
};

export const loadMatches = (): Match[] => {
  const payload = readPayload();
  if (payload) {
    return [...payload.items];
  }

  const initial = normalizeSeed();
  writePayload(initial);
  return initial;
};

export const saveMatches = (items: Match[]): Match[] => {
  writePayload(items);
  return [...items];
};
