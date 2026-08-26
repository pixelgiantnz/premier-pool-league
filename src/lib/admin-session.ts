import { redirect } from "next/navigation";
import type { AccessTier } from "../../lib/auth/tiers";
import { tierAllowsMasterAdminActions } from "../../lib/auth/tiers";
import { getCurrentAccessTier, getSessionToken } from "./session";

export async function requireMasterAdminPageAccess(): Promise<{
  tier: AccessTier;
  sessionToken: string;
}> {
  const tier = await getCurrentAccessTier();
  if (!tierAllowsMasterAdminActions(tier)) {
    redirect("/admin/login");
  }

  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    redirect("/admin/login");
  }

  return { tier, sessionToken };
}
