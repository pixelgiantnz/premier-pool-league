import { cookies } from "next/headers";
import { fetchSessionTier, SESSION_COOKIE } from "./convex-server";
import type { AccessTier } from "../../lib/auth/tiers";

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

export async function getCurrentAccessTier(): Promise<AccessTier> {
  const token = await getSessionToken();
  if (!token) return "none";
  return fetchSessionTier(token);
}
