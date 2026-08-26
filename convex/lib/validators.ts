import { v } from "convex/values";
import schema from "../schema";

export const playerSummaryValidator = schema
  .doc("players")
  .pick("_id", "displayName", "nickname", "avatar", "blurb");

export const leagueSummaryValidator = schema
  .doc("leagues")
  .pick("_id", "name", "format", "status");

export const rosterPlayerValidator = v.object({
  rosterId: v.id("leagueRosters"),
  ...playerSummaryValidator.fields,
});

export const masterAdminQueryArgs = {
  sessionToken: v.string(),
  now: v.number(),
};
