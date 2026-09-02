import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type DbCtx = QueryCtx | MutationCtx;

export async function requirePlayer(ctx: DbCtx, playerId: Id<"players">) {
  const player = await ctx.db.get(playerId);
  if (!player) {
    throw new Error("Player not found");
  }
  return player;
}

export function toPlayerSummary(player: Doc<"players">) {
  return {
    _id: player._id,
    displayName: player.displayName,
    nickname: player.nickname,
    avatar: player.avatar,
    blurb: player.blurb,
  };
}

export async function loadRosterPlayers(
  ctx: QueryCtx,
  leagueId: Id<"leagues">,
) {
  const rosterEntries = await ctx.db
    .query("leagueRosters")
    .withIndex("by_league", (q) => q.eq("leagueId", leagueId))
    .collect();

  const players = await Promise.all(
    rosterEntries.map(async (entry) => {
      const player = await ctx.db.get(entry.playerId);
      if (!player) return null;
      return {
        rosterId: entry._id,
        ...toPlayerSummary(player),
      };
    }),
  );

  return players
    .filter((player): player is NonNullable<typeof player> => player !== null)
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}
