import initialMatches from "../data/matches.json";

export type Match = {
  id: number;
  champion: string;
  role: string;
  icon: string;
  iconBg: string;
  result: "Victory" | "Defeat";
  kda: [number, number, number];
  cs: number;
  duration: string;
  date: string;
  score: number;
  scoreClass: "scoreHigh" | "scoreMid" | "scoreLow";
};

const STORAGE_KEY = "caietul_matches";

// Initialize localStorage with default data if empty
function initializeStorage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMatches));
  }
}

export function getMatches(): Match[] {
  initializeStorage();
  const stored = localStorage.getItem(STORAGE_KEY);
  const parsed = stored ? JSON.parse(stored) : initialMatches;
  return parsed.map((m: any) => ({
    ...m,
    result: m.result as "Victory" | "Defeat",
  }));
}

export function getMatchById(id: number): Match | undefined {
  const matches = getMatches();
  return matches.find((m) => m.id === id);
}

export function addMatch(matchData: Omit<Match, "id">): Match {
  const matches = getMatches();
  const newId = Math.max(...matches.map((m) => m.id), -1) + 1;
  const newMatch: Match = { ...matchData, id: newId };
  matches.push(newMatch);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
  return newMatch;
}

export function updateMatch(
  id: number,
  matchData: Partial<Match>,
): Match | null {
  const matches = getMatches();
  const index = matches.findIndex((m) => m.id === id);
  if (index === -1) return null;

  matches[index] = { ...matches[index], ...matchData, id }; // Ensure id doesn't change
  localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
  return matches[index];
}

export function deleteMatch(id: number): boolean {
  const matches = getMatches();
  const newMatches = matches.filter((m) => m.id !== id);
  if (newMatches.length === matches.length) return false; // Match not found

  localStorage.setItem(STORAGE_KEY, JSON.stringify(newMatches));
  return true;
}
