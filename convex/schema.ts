import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const sessionTier = v.union(
  v.literal("viewer"),
  v.literal("kiosk"),
  v.literal("masterAdmin"),
);

export default defineSchema({
  masterAdmins: defineTable({
    email: v.string(),
    passwordHash: v.string(),
  }).index("by_email", ["email"]),

  platformSettings: defineTable({
    platformPasswordHash: v.string(),
    kioskPasswordHash: v.string(),
  }),

  sessions: defineTable({
    token: v.string(),
    tier: sessionTier,
    masterAdminId: v.optional(v.id("masterAdmins")),
    expiresAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_expiresAt", ["expiresAt"]),
});
