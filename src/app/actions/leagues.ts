"use server";

import { redirect } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { getConvexClient } from "@/lib/convex-server";
import {
  mutationErrorMessage,
  requireFormId,
  requireMasterAdminSessionToken,
} from "@/lib/server-action-utils";
import { isLeagueFormat } from "../../../lib/league/format";

export async function createLeagueAction(formData: FormData) {
  const sessionToken = await requireMasterAdminSessionToken();
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

export async function deleteLeagueAction(formData: FormData) {
  const sessionToken = await requireMasterAdminSessionToken();
  const leagueId = requireFormId<"leagues">(
    formData,
    "leagueId",
    "/admin/leagues?error=invalid-league",
  );

  const client = getConvexClient();
  try {
    await client.mutation(api.leagues.deleteLeague, {
      sessionToken,
      leagueId,
    });
  } catch (error) {
    redirect(
      `/admin/leagues?error=${encodeURIComponent(mutationErrorMessage(error, "Could not delete League"))}`,
    );
  }

  redirect("/admin/leagues?deleted=1");
}

export async function addPlayerToLeagueAction(formData: FormData) {
  const sessionToken = await requireMasterAdminSessionToken();
  const leagueId = requireFormId<"leagues">(
    formData,
    "leagueId",
    "/admin/leagues?error=invalid-league",
  );
  const playerId = requireFormId<"players">(
    formData,
    "playerId",
    `/admin/leagues/${leagueId}?error=invalid-player`,
  );

  const client = getConvexClient();
  try {
    await client.mutation(api.players.addPlayerToLeague, {
      sessionToken,
      leagueId,
      playerId,
    });
  } catch (error) {
    redirect(
      `/admin/leagues/${leagueId}?error=${encodeURIComponent(mutationErrorMessage(error, "Could not add Player to roster"))}`,
    );
  }

  redirect(`/admin/leagues/${leagueId}?added=1`);
}

export async function removePlayerFromLeagueAction(formData: FormData) {
  const sessionToken = await requireMasterAdminSessionToken();
  const leagueId = requireFormId<"leagues">(
    formData,
    "leagueId",
    "/admin/leagues?error=invalid-league",
  );
  const playerId = requireFormId<"players">(
    formData,
    "playerId",
    `/admin/leagues/${leagueId}?error=invalid-player`,
  );

  const client = getConvexClient();
  try {
    await client.mutation(api.players.removePlayerFromLeague, {
      sessionToken,
      leagueId,
      playerId,
    });
  } catch (error) {
    redirect(
      `/admin/leagues/${leagueId}?error=${encodeURIComponent(mutationErrorMessage(error, "Could not remove Player from roster"))}`,
    );
  }

  redirect(`/admin/leagues/${leagueId}?removed=1`);
}
