import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type DbCtx = QueryCtx | MutationCtx;

export async function requireLeague(ctx: DbCtx, leagueId: Id<"leagues">) {
  const league = await ctx.db.get(leagueId);
  if (!league) {
    throw new Error("League not found");
  }
  return league;
}
