import type { Role } from "./match";

export type Champion = {
  name: string;
  icon: string;
  role: Role;
  matchesCount: number;
  wins: number;
  losses: number;
  winRate: number;
};

export type ChampionInput = {
  name: string;
  icon: string;
  role: Role;
};
