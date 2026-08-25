export type AccessTier = "none" | "viewer" | "kiosk" | "masterAdmin";

export function tierAllowsLeagueRead(tier: AccessTier): boolean {
  return tier === "viewer" || tier === "kiosk" || tier === "masterAdmin";
}

export function tierAllowsKioskRecord(tier: AccessTier): boolean {
  return tier === "kiosk" || tier === "masterAdmin";
}

export function tierAllowsMasterAdminActions(tier: AccessTier): boolean {
  return tier === "masterAdmin";
}

/** Kiosk password unlock applies only after Platform password (Viewer session). */
export function upgradeTierWithKioskPassword(
  current: AccessTier,
): AccessTier | null {
  if (current === "viewer") return "kiosk";
  if (current === "kiosk" || current === "masterAdmin") return current;
  return null;
}

export function accessTierLabel(tier: AccessTier): string {
  switch (tier) {
    case "none":
      return "Unauthenticated";
    case "viewer":
      return "Viewer";
    case "kiosk":
      return "Kiosk";
    case "masterAdmin":
      return "Master Admin";
  }
}
