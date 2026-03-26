import type { Match } from "../types/match";

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

export const validateMatch = (data: Partial<Match>): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!data.champion || data.champion.trim().length === 0)
    errors.champion = "Champion name is required.";
  else if (data.champion.trim().length > 30)
    errors.champion = "Champion name must be 30 characters or fewer.";

  if (data.kills === undefined || data.kills === null || isNaN(data.kills))
    errors.kills = "Kills must be a number.";
  else if (data.kills < 0 || data.kills > 99)
    errors.kills = "Kills must be between 0 and 99.";

  if (data.deaths === undefined || data.deaths === null || isNaN(data.deaths))
    errors.deaths = "Deaths must be a number.";
  else if (data.deaths < 0 || data.deaths > 99)
    errors.deaths = "Deaths must be between 0 and 99.";

  if (
    data.assists === undefined ||
    data.assists === null ||
    isNaN(data.assists)
  )
    errors.assists = "Assists must be a number.";
  else if (data.assists < 0 || data.assists > 99)
    errors.assists = "Assists must be between 0 and 99.";

  if (data.cs === undefined || data.cs === null || isNaN(data.cs))
    errors.cs = "CS must be a number.";
  else if (data.cs < 0 || data.cs > 1500)
    errors.cs = "CS must be between 0 and 1500.";

  if (
    data.visionScore === undefined ||
    data.visionScore === null ||
    isNaN(data.visionScore)
  )
    errors.visionScore = "Vision score must be a number.";
  else if (data.visionScore < 0 || data.visionScore > 300)
    errors.visionScore = "Vision score must be between 0 and 300.";

  if (
    data.duration === undefined ||
    data.duration === null ||
    isNaN(data.duration)
  )
    errors.duration = "Duration must be a number.";
  else if (data.duration < 60 || data.duration > 7200)
    errors.duration = "Duration must be between 1 and 120 minutes.";

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

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_MATCHES: Match[] = [
  {
    id: "match-001",
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
    notes: "Stomped lane, great roam timing.",
  },
  {
    id: "match-002",
    champion: "Graves",
    role: "Jungle",
    result: "Defeat",
    kills: 4,
    deaths: 6,
    assists: 3,
    cs: 195,
    visionScore: 18,
    duration: 2340,
    date: "2025-03-20T20:10:00Z",
    patch: "25.6",
    notes: "Enemy jungler had perfect pathing.",
  },
  {
    id: "match-003",
    champion: "Syndra",
    role: "Mid",
    result: "Victory",
    kills: 12,
    deaths: 1,
    assists: 10,
    cs: 310,
    visionScore: 42,
    duration: 1650,
    date: "2025-03-19T17:00:00Z",
    patch: "25.6",
  },
  {
    id: "match-004",
    champion: "Nidalee",
    role: "Jungle",
    result: "Defeat",
    kills: 3,
    deaths: 8,
    assists: 5,
    cs: 178,
    visionScore: 22,
    duration: 2580,
    date: "2025-03-19T19:45:00Z",
    patch: "25.6",
    notes: "Tilted hard after first death.",
  },
  {
    id: "match-005",
    champion: "Orianna",
    role: "Mid",
    result: "Victory",
    kills: 6,
    deaths: 3,
    assists: 14,
    cs: 265,
    visionScore: 38,
    duration: 2100,
    date: "2025-03-18T16:20:00Z",
    patch: "25.5",
  },
  {
    id: "match-006",
    champion: "Lee Sin",
    role: "Jungle",
    result: "Victory",
    kills: 8,
    deaths: 4,
    assists: 9,
    cs: 210,
    visionScore: 29,
    duration: 1980,
    date: "2025-03-18T21:00:00Z",
    patch: "25.5",
  },
  {
    id: "match-007",
    champion: "Zed",
    role: "Mid",
    result: "Defeat",
    kills: 5,
    deaths: 7,
    assists: 2,
    cs: 230,
    visionScore: 15,
    duration: 2700,
    date: "2025-03-17T15:30:00Z",
    patch: "25.5",
    notes: "Bad matchup into Malzahar.",
  },
  {
    id: "match-008",
    champion: "Kha'Zix",
    role: "Jungle",
    result: "Victory",
    kills: 11,
    deaths: 2,
    assists: 6,
    cs: 220,
    visionScore: 25,
    duration: 1740,
    date: "2025-03-17T18:00:00Z",
    patch: "25.5",
  },
  {
    id: "match-009",
    champion: "Viktor",
    role: "Mid",
    result: "Victory",
    kills: 7,
    deaths: 3,
    assists: 11,
    cs: 298,
    visionScore: 40,
    duration: 2220,
    date: "2025-03-16T20:00:00Z",
    patch: "25.5",
  },
  {
    id: "match-010",
    champion: "Graves",
    role: "Jungle",
    result: "Remake",
    kills: 0,
    deaths: 0,
    assists: 0,
    cs: 12,
    visionScore: 2,
    duration: 210,
    date: "2025-03-16T22:15:00Z",
    patch: "25.5",
    notes: "AFK in base from the start.",
  },
  {
    id: "match-011",
    champion: "Syndra",
    role: "Mid",
    result: "Defeat",
    kills: 4,
    deaths: 5,
    assists: 8,
    cs: 241,
    visionScore: 31,
    duration: 2460,
    date: "2025-03-15T17:40:00Z",
    patch: "25.4",
  },
  {
    id: "match-012",
    champion: "Hecarim",
    role: "Jungle",
    result: "Victory",
    kills: 6,
    deaths: 3,
    assists: 13,
    cs: 245,
    visionScore: 28,
    duration: 1890,
    date: "2025-03-15T19:30:00Z",
    patch: "25.4",
  },
];

// ── Store ─────────────────────────────────────────────────────────────────────

let matches: Match[] = [...MOCK_MATCHES];

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
    return newMatch;
  },

  update(id: string, data: Omit<Match, "id">): Match | null {
    const index = matches.findIndex((m) => m.id === id);
    if (index === -1) return null;
    const updated: Match = { ...data, id };
    matches = matches.map((m) => (m.id === id ? updated : m));
    return updated;
  },

  delete(id: string): boolean {
    const before = matches.length;
    matches = matches.filter((m) => m.id !== id);
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
