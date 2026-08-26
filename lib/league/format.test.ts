import { describe, expect, it } from "vitest";
import {
  gamesRequiredPerPairing,
  isLeagueFormat,
  leagueFormatLabel,
} from "./format";

describe("League format", () => {
  it("single round-robin requires one Game per pair", () => {
    expect(gamesRequiredPerPairing("singleRoundRobin")).toBe(1);
    expect(leagueFormatLabel("singleRoundRobin")).toBe("Single round-robin");
  });

  it("double round-robin requires two Games per pair", () => {
    expect(gamesRequiredPerPairing("doubleRoundRobin")).toBe(2);
    expect(leagueFormatLabel("doubleRoundRobin")).toBe("Double round-robin");
  });

  it("recognises valid League formats", () => {
    expect(isLeagueFormat("singleRoundRobin")).toBe(true);
    expect(isLeagueFormat("doubleRoundRobin")).toBe(true);
    expect(isLeagueFormat("fixtures")).toBe(false);
  });
});
