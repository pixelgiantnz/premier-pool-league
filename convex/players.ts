import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { MAX_ADMIN_LIST_ROWS } from "./lib/limits";
import { requireLeague } from "./lib/leagues";
import { loadRosterPlayers, toPlayerSummary } from "./lib/players";
import { requireMasterAdminSession } from "./lib/sessions";
import {
  masterAdminQueryArgs,
  playerSummaryValidator,
  rosterPlayerValidator,
} from "./lib/validators";

function normalizeRequired(value: string, label: string): string {
  const trimmed = value.trim();
  if (trimmed.length < 1) {
    throw new Error(`${label} is required`);
  }
  return trimmed;
}

export const listAllPlayers = query({
  args: masterAdminQueryArgs,
  returns: v.array(playerSummaryValidator),
  handler: async (ctx, { sessionToken, now }) => {
    await requireMasterAdminSession(ctx, sessionToken, now);

    const players = await ctx.db.query("players").take(MAX_ADMIN_LIST_ROWS);
    return players
      .map(toPlayerSummary)
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  },
});

export const listRosterByLeague = query({
  args: {
    ...masterAdminQueryArgs,
    leagueId: v.id("leagues"),
  },
  returns: v.array(rosterPlayerValidator),
  handler: async (ctx, { sessionToken, now, leagueId }) => {
    await requireMasterAdminSession(ctx, sessionToken, now);
    await requireLeague(ctx, leagueId);
    return loadRosterPlayers(ctx, leagueId);
  },
});

export const listAvailablePlayersForLeague = query({
  args: {
    ...masterAdminQueryArgs,
    leagueId: v.id("leagues"),
  },
  returns: v.array(playerSummaryValidator),
  handler: async (ctx, { sessionToken, now, leagueId }) => {
    await requireMasterAdminSession(ctx, sessionToken, now);
    await requireLeague(ctx, leagueId);

    const [allPlayers, rosterEntries] = await Promise.all([
      ctx.db.query("players").take(MAX_ADMIN_LIST_ROWS),
      ctx.db
        .query("leagueRosters")
        .withIndex("by_league", (q) => q.eq("leagueId", leagueId))
        .collect(),
    ]);

    const rosterPlayerIds = new Set(rosterEntries.map((entry) => entry.playerId));

    return allPlayers
      .filter((player) => !rosterPlayerIds.has(player._id))
      .map(toPlayerSummary)
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
    await requireMasterAdminSession(ctx, sessionToken, Date.now());

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
    await requireMasterAdminSession(ctx, sessionToken, Date.now());

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
    await requireMasterAdminSession(ctx, sessionToken, Date.now());

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
    await requireMasterAdminSession(ctx, sessionToken, Date.now());

    await requireLeague(ctx, leagueId);
    const player = await ctx.db.get(playerId);

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
    await requireMasterAdminSession(ctx, sessionToken, Date.now());

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
