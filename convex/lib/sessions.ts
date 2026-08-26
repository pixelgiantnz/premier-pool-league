import type { MutationCtx, QueryCtx } from "../_generated/server";
import {
  tierAllowsMasterAdminActions,
  type AccessTier,
} from "../../lib/auth/tiers";

type DbCtx = QueryCtx | MutationCtx;

export async function getSessionByToken(ctx: DbCtx, token: string) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .unique();

  if (!session || session.expiresAt < Date.now()) {
    return null;
  }

  return session;
}

export async function requireMasterAdminSession(ctx: DbCtx, token: string) {
  const session = await getSessionByToken(ctx, token);
  if (
    !session ||
    !tierAllowsMasterAdminActions(session.tier as AccessTier)
  ) {
    throw new Error("Master Admin session required");
  }
  return session;
}
