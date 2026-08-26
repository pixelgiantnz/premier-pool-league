"use server";

import { redirect } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { getConvexClient } from "@/lib/convex-server";
import { getSessionToken } from "@/lib/session";
import { isLeagueFormat } from "../../../lib/league/format";

function mutationErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

async function requireSessionToken(): Promise<string> {
  const token = await getSessionToken();
  if (!token) redirect("/admin/login");
  return token;
}

export async function createLeagueAction(formData: FormData) {
  const sessionToken = await requireSessionToken();
  const name = String(formData.get("name") ?? "");
  const formatRaw = String(formData.get("format") ?? "");

  if (!isLeagueFormat(formatRaw)) {
    redirect("/admin/leagues?error=invalid-format");
  }

  const client = getConvexClient();
  try {
    await client.mutation(api.leagues.createLeague, {
      sessionToken,
      name,
      format: formatRaw,
    });
  } catch (error) {
    redirect(
      `/admin/leagues?error=${encodeURIComponent(mutationErrorMessage(error, "Could not create League"))}`,
    );
  }

  redirect("/admin/leagues?created=1");
}

export async function createPlayerAction(formData: FormData) {
  const sessionToken = await requireSessionToken();
  const leagueId = String(formData.get("leagueId") ?? "") as Id<"leagues">;
  const displayName = String(formData.get("displayName") ?? "");
  const nickname = String(formData.get("nickname") ?? "");
  const avatar = String(formData.get("avatar") ?? "");
  const blurb = String(formData.get("blurb") ?? "");

  const client = getConvexClient();
  try {
    await client.mutation(api.players.createPlayer, {
      sessionToken,
      leagueId,
      displayName,
      nickname,
      avatar,
      blurb: blurb.trim() || undefined,
    });
  } catch (error) {
    redirect(
      `/admin/leagues/${leagueId}?error=${encodeURIComponent(mutationErrorMessage(error, "Could not add Player"))}`,
    );
  }

  redirect(`/admin/leagues/${leagueId}?added=1`);
}

export async function updatePlayerAction(formData: FormData) {
  const sessionToken = await requireSessionToken();
  const leagueId = String(formData.get("leagueId") ?? "") as Id<"leagues">;
  const playerId = String(formData.get("playerId") ?? "") as Id<"players">;
  const displayName = String(formData.get("displayName") ?? "");
  const nickname = String(formData.get("nickname") ?? "");
  const avatar = String(formData.get("avatar") ?? "");
  const blurb = String(formData.get("blurb") ?? "");

  const client = getConvexClient();
  try {
    await client.mutation(api.players.updatePlayer, {
      sessionToken,
      playerId,
      displayName,
      nickname,
      avatar,
      blurb: blurb.trim() || undefined,
    });
  } catch (error) {
    redirect(
      `/admin/leagues/${leagueId}?error=${encodeURIComponent(mutationErrorMessage(error, "Could not update Player"))}`,
    );
  }

  redirect(`/admin/leagues/${leagueId}?saved=1`);
}

export async function removePlayerAction(formData: FormData) {
  const sessionToken = await requireSessionToken();
  const leagueId = String(formData.get("leagueId") ?? "") as Id<"leagues">;
  const playerId = String(formData.get("playerId") ?? "") as Id<"players">;

  const client = getConvexClient();
  try {
    await client.mutation(api.players.removePlayer, {
      sessionToken,
      playerId,
    });
  } catch (error) {
    redirect(
      `/admin/leagues/${leagueId}?error=${encodeURIComponent(mutationErrorMessage(error, "Could not remove Player"))}`,
    );
  }

  redirect(`/admin/leagues/${leagueId}?removed=1`);
}
