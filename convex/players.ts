import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireMasterAdminSession } from "./lib/sessions";

function normalizeRequired(value: string, label: string): string {
  const trimmed = value.trim();
  if (trimmed.length < 1) {
    throw new Error(`${label} is required`);
  }
  return trimmed;
}

function playerSummary(player: {
  _id: import("./_generated/dataModel").Id<"players">;
  displayName: string;
  nickname: string;
  avatar: string;
  blurb?: string;
}) {
  return {
    _id: player._id,
    displayName: player.displayName,
    nickname: player.nickname,
    avatar: player.avatar,
    blurb: player.blurb,
  };
}

export const listAllPlayers = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    await requireMasterAdminSession(ctx, sessionToken);

    const players = await ctx.db.query("players").collect();
    return players
      .map(playerSummary)
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  },
});

export const listRosterByLeague = query({
  args: {
    sessionToken: v.string(),
    leagueId: v.id("leagues"),
  },
  handler: async (ctx, { sessionToken, leagueId }) => {
    await requireMasterAdminSession(ctx, sessionToken);

    const league = await ctx.db.get(leagueId);
    if (!league) {
      throw new Error("League not found");
    }

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
          ...playerSummary(player),
        };
      }),
    );

    return players
      .filter((player): player is NonNullable<typeof player> => player !== null)
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  },
});

export const listAvailablePlayersForLeague = query({
  args: {
    sessionToken: v.string(),
    leagueId: v.id("leagues"),
  },
  handler: async (ctx, { sessionToken, leagueId }) => {
    await requireMasterAdminSession(ctx, sessionToken);

    const league = await ctx.db.get(leagueId);
    if (!league) {
      throw new Error("League not found");
    }

    const [allPlayers, rosterEntries] = await Promise.all([
      ctx.db.query("players").collect(),
      ctx.db
        .query("leagueRosters")
        .withIndex("by_league", (q) => q.eq("leagueId", leagueId))
        .collect(),
    ]);

    const rosterPlayerIds = new Set(rosterEntries.map((entry) => entry.playerId));

    return allPlayers
      .filter((player) => !rosterPlayerIds.has(player._id))
      .map(playerSummary)
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  },
});

export const createPlayer = mutation({
  args: {
    sessionToken: v.string(),
    displayName: v.string(),
    nickname: v.string(),
    avatar: v.string(),
    blurb: v.optional(v.string()),
  },
  handler: async (ctx, { sessionToken, displayName, nickname, avatar, blurb }) => {
    await requireMasterAdminSession(ctx, sessionToken);

    const playerId = await ctx.db.insert("players", {
      displayName: normalizeRequired(displayName, "Display name"),
      nickname: normalizeRequired(nickname, "Nickname"),
      avatar: normalizeRequired(avatar, "Avatar"),
      blurb: blurb?.trim() || undefined,
    });

    return { playerId };
  },
});

export const updatePlayer = mutation({
  args: {
    sessionToken: v.string(),
    playerId: v.id("players"),
    displayName: v.string(),
    nickname: v.string(),
    avatar: v.string(),
    blurb: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { sessionToken, playerId, displayName, nickname, avatar, blurb },
  ) => {
    await requireMasterAdminSession(ctx, sessionToken);

    const player = await ctx.db.get(playerId);
    if (!player) {
      throw new Error("Player not found");
    }

    await ctx.db.patch(playerId, {
      displayName: normalizeRequired(displayName, "Display name"),
      nickname: normalizeRequired(nickname, "Nickname"),
      avatar: normalizeRequired(avatar, "Avatar"),
      blurb: blurb?.trim() || undefined,
    });

    return { ok: true as const };
  },
});

export const removePlayer = mutation({
  args: {
    sessionToken: v.string(),
    playerId: v.id("players"),
  },
  handler: async (ctx, { sessionToken, playerId }) => {
    await requireMasterAdminSession(ctx, sessionToken);

    const player = await ctx.db.get(playerId);
    if (!player) {
      throw new Error("Player not found");
    }

    const rosterEntries = await ctx.db
      .query("leagueRosters")
      .withIndex("by_player", (q) => q.eq("playerId", playerId))
      .collect();

    for (const entry of rosterEntries) {
      await ctx.db.delete(entry._id);
    }

    await ctx.db.delete(playerId);
    return { ok: true as const };
  },
});

export const addPlayerToLeague = mutation({
  args: {
    sessionToken: v.string(),
    leagueId: v.id("leagues"),
    playerId: v.id("players"),
  },
  handler: async (ctx, { sessionToken, leagueId, playerId }) => {
    await requireMasterAdminSession(ctx, sessionToken);

    const [league, player] = await Promise.all([
      ctx.db.get(leagueId),
      ctx.db.get(playerId),
    ]);

    if (!league) {
      throw new Error("League not found");
    }
    if (!player) {
      throw new Error("Player not found");
    }

    const existing = await ctx.db
      .query("leagueRosters")
      .withIndex("by_league_and_player", (q) =>
        q.eq("leagueId", leagueId).eq("playerId", playerId),
      )
      .unique();

    if (existing) {
      throw new Error("Player is already on this League roster");
    }

    await ctx.db.insert("leagueRosters", { leagueId, playerId });
    return { ok: true as const };
  },
});

export const removePlayerFromLeague = mutation({
  args: {
    sessionToken: v.string(),
    leagueId: v.id("leagues"),
    playerId: v.id("players"),
  },
  handler: async (ctx, { sessionToken, leagueId, playerId }) => {
    await requireMasterAdminSession(ctx, sessionToken);

    const entry = await ctx.db
      .query("leagueRosters")
      .withIndex("by_league_and_player", (q) =>
        q.eq("leagueId", leagueId).eq("playerId", playerId),
      )
      .unique();

    if (!entry) {
      throw new Error("Player is not on this League roster");
    }

    await ctx.db.delete(entry._id);
    return { ok: true as const };
  },
});
