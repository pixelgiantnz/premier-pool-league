import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const sessionTier = v.union(
  v.literal("viewer"),
  v.literal("kiosk"),
  v.literal("masterAdmin"),
);

export const leagueFormat = v.union(
  v.literal("singleRoundRobin"),
  v.literal("doubleRoundRobin"),
);

export const leagueStatus = v.union(v.literal("active"), v.literal("past"));

export default defineSchema({
  masterAdmins: defineTable({
    email: v.string(),
    passwordHash: v.string(),
  }).index("by_email", ["email"]),

  platformSettings: defineTable({
    platformPasswordHash: v.optional(v.string()),
    kioskPasswordHash: v.optional(v.string()),
  }),

  sessions: defineTable({
    token: v.string(),
    tier: sessionTier,
    masterAdminId: v.optional(v.id("masterAdmins")),
    expiresAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_expiresAt", ["expiresAt"]),

  leagues: defineTable({
    name: v.string(),
    format: leagueFormat,
    status: leagueStatus,
  }).index("by_status", ["status"]),

  players: defineTable({
    displayName: v.string(),
    nickname: v.string(),
    avatar: v.string(),
    blurb: v.optional(v.string()),
  }),

  leagueRosters: defineTable({
    leagueId: v.id("leagues"),
    playerId: v.id("players"),
  })
    .index("by_league", ["leagueId"])
    .index("by_player", ["playerId"])
    .index("by_league_and_player", ["leagueId", "playerId"]),
});
