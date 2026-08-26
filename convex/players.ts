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

export const listPlayersByLeague = query({
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

    const players = await ctx.db
      .query("players")
      .withIndex("by_league", (q) => q.eq("leagueId", leagueId))
      .collect();

    return players
      .map((player) => ({
        _id: player._id,
        displayName: player.displayName,
        nickname: player.nickname,
        avatar: player.avatar,
        blurb: player.blurb,
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  },
});

export const createPlayer = mutation({
  args: {
    sessionToken: v.string(),
    leagueId: v.id("leagues"),
    displayName: v.string(),
    nickname: v.string(),
    avatar: v.string(),
    blurb: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { sessionToken, leagueId, displayName, nickname, avatar, blurb },
  ) => {
    await requireMasterAdminSession(ctx, sessionToken);

    const league = await ctx.db.get(leagueId);
    if (!league) {
      throw new Error("League not found");
    }

    const playerId = await ctx.db.insert("players", {
      leagueId,
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

    await ctx.db.delete(playerId);
    return { ok: true as const };
  },
});
