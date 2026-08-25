import { describe, expect, it } from "vitest";
import {
  tierAllowsKioskRecord,
  tierAllowsLeagueRead,
  tierAllowsMasterAdminActions,
  upgradeTierWithKioskPassword,
} from "./tiers";

describe("access tiers", () => {
  it("Viewer can read league content but not record Shots", () => {
    expect(tierAllowsLeagueRead("viewer")).toBe(true);
    expect(tierAllowsKioskRecord("viewer")).toBe(false);
  });

  it("Kiosk can read league content and record Shots", () => {
    expect(tierAllowsLeagueRead("kiosk")).toBe(true);
    expect(tierAllowsKioskRecord("kiosk")).toBe(true);
  });

  it("Master Admin can manage the Platform", () => {
    expect(tierAllowsMasterAdminActions("masterAdmin")).toBe(true);
    expect(tierAllowsKioskRecord("masterAdmin")).toBe(true);
  });

  it("unauthenticated users cannot access league content", () => {
    expect(tierAllowsLeagueRead("none")).toBe(false);
    expect(tierAllowsKioskRecord("none")).toBe(false);
  });

  it("Kiosk password upgrades Viewer to Kiosk", () => {
    expect(upgradeTierWithKioskPassword("viewer")).toBe("kiosk");
  });

  it("Kiosk password does not upgrade unauthenticated sessions", () => {
    expect(upgradeTierWithKioskPassword("none")).toBeNull();
  });

  it("Kiosk password keeps existing Kiosk session", () => {
    expect(upgradeTierWithKioskPassword("kiosk")).toBe("kiosk");
  });
});
