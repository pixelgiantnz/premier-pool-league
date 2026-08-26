import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { leagueFormat } from "./schema";
import { MAX_ADMIN_LIST_ROWS } from "./lib/limits";
import { requireLeague } from "./lib/leagues";
import { requireMasterAdminSession } from "./lib/sessions";
import {
  leagueSummaryValidator,
  masterAdminQueryArgs,
} from "./lib/validators";

export const listLeagues = query({
  args: masterAdminQueryArgs,
  returns: v.array(leagueSummaryValidator),
  handler: async (ctx, { sessionToken, now }) => {
    await requireMasterAdminSession(ctx, sessionToken, now);

    const leagues = await ctx.db.query("leagues").take(MAX_ADMIN_LIST_ROWS);
    return leagues
      .map((league) => ({
        _id: league._id,
        name: league.name,
        format: league.format,
        status: league.status,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const getLeague = query({
  args: {
    ...masterAdminQueryArgs,
    leagueId: v.id("leagues"),
  },
  returns: leagueSummaryValidator,
  handler: async (ctx, { sessionToken, now, leagueId }) => {
    await requireMasterAdminSession(ctx, sessionToken, now);

    const league = await requireLeague(ctx, leagueId);

    return {
      _id: league._id,
      name: league.name,
      format: league.format,
      status: league.status,
    };
  },
});

export const createLeague = mutation({
  args: {
    sessionToken: v.string(),
    name: v.string(),
    format: leagueFormat,
  },
  handler: async (ctx, { sessionToken, name, format }) => {
    await requireMasterAdminSession(ctx, sessionToken, Date.now());

    const trimmedName = name.trim();
    if (trimmedName.length < 1) {
      throw new Error("League name is required");
    }

    const leagueId = await ctx.db.insert("leagues", {
      name: trimmedName,
      format,
      status: "active",
    });

    return { leagueId };
  },
});

export const deleteLeague = mutation({
  args: {
    sessionToken: v.string(),
    leagueId: v.id("leagues"),
  },
  handler: async (ctx, { sessionToken, leagueId }) => {
    await requireMasterAdminSession(ctx, sessionToken, Date.now());

    await requireLeague(ctx, leagueId);

    const rosterEntries = await ctx.db
      .query("leagueRosters")
      .withIndex("by_league", (q) => q.eq("leagueId", leagueId))
      .collect();

    for (const entry of rosterEntries) {
      await ctx.db.delete(entry._id);
    }

    await ctx.db.delete(leagueId);
    return { ok: true as const };
  },
});
