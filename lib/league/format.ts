export type LeagueFormat = "singleRoundRobin" | "doubleRoundRobin";

export function leagueFormatLabel(format: LeagueFormat): string {
  switch (format) {
    case "singleRoundRobin":
      return "Single round-robin";
    case "doubleRoundRobin":
      return "Double round-robin";
  }
}

/** Official Games required between each Player pair (ADR-0001). */
export function gamesRequiredPerPairing(format: LeagueFormat): number {
  return format === "singleRoundRobin" ? 1 : 2;
}

export function isLeagueFormat(value: string): value is LeagueFormat {
  return value === "singleRoundRobin" || value === "doubleRoundRobin";
}
