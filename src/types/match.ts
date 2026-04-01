export const ROLES = ["Top", "Jungle", "Mid", "Bot", "Support"] as const;
export type Role = (typeof ROLES)[number];

export const RESULTS = ["Victory", "Defeat", "Remake"] as const;
export type Result = (typeof RESULTS)[number];
export type Rank =
  | "Iron"
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Emerald"
  | "Diamond"
  | "Master"
  | "Grandmaster"
  | "Challenger";

export interface Match {
  id: string;
  champion: string;
  role: Role;
  result: Result;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  visionScore: number;
  duration: number; // in seconds
  date: string; // ISO string
  patch: string;
  notes?: string;
}
