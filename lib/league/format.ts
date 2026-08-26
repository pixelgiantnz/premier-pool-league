export type LeagueFormat = "singleRoundRobin" | "doubleRoundRobin";

export const LEAGUE_FORMATS = [
  "singleRoundRobin",
  "doubleRoundRobin",
] as const satisfies readonly LeagueFormat[];

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
  return (LEAGUE_FORMATS as readonly string[]).includes(value);
}

export function leagueFormatOptions(): Array<{
  value: LeagueFormat;
  label: string;
}> {
  return LEAGUE_FORMATS.map((format) => ({
    value: format,
    label: leagueFormatLabel(format),
  }));
}
