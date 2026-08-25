import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import type { AccessTier } from "../../lib/auth/tiers";

export const SESSION_COOKIE = "ppl_session";

export function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL is not set. Run `npx convex dev` to link Convex.",
    );
  }
  return new ConvexHttpClient(url);
}

export async function fetchSessionTier(token: string): Promise<AccessTier> {
  const client = getConvexClient();
  const session = await client.query(api.auth.getSessionByToken, { token });
  if (!session) return "none";
  return session.tier;
}

export async function hasMasterAdminAccount(): Promise<boolean> {
  const client = getConvexClient();
  return client.query(api.auth.hasMasterAdmin, {});
}

export async function platformPasswordsConfigured(): Promise<boolean> {
  const client = getConvexClient();
  return client.query(api.auth.passwordsConfigured, {});
}
