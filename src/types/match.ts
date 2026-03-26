export type Role = "Top" | "Jungle" | "Mid" | "Bot" | "Support";
export type Result = "Victory" | "Defeat" | "Remake";
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
