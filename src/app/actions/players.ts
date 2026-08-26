"use server";

import { redirect } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { getConvexClient } from "@/lib/convex-server";
import {
  mutationErrorMessage,
  requireFormId,
  requireMasterAdminSessionToken,
} from "@/lib/server-action-utils";

export async function createPlayerAction(formData: FormData) {
  const sessionToken = await requireMasterAdminSessionToken();
  const displayName = String(formData.get("displayName") ?? "");
  const nickname = String(formData.get("nickname") ?? "");
  const avatar = String(formData.get("avatar") ?? "");
  const blurb = String(formData.get("blurb") ?? "");

  const client = getConvexClient();
  try {
    await client.mutation(api.players.createPlayer, {
      sessionToken,
      displayName,
      nickname,
      avatar,
      blurb: blurb.trim() || undefined,
    });
  } catch (error) {
    redirect(
      `/admin/players?error=${encodeURIComponent(mutationErrorMessage(error, "Could not create Player"))}`,
    );
  }

  redirect("/admin/players?created=1");
}

export async function updatePlayerAction(formData: FormData) {
  const sessionToken = await requireMasterAdminSessionToken();
  const playerId = requireFormId<"players">(
    formData,
    "playerId",
    "/admin/players?error=invalid-player",
  );
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
      `/admin/players?error=${encodeURIComponent(mutationErrorMessage(error, "Could not update Player"))}`,
    );
  }

  redirect("/admin/players?saved=1");
}

export async function removePlayerAction(formData: FormData) {
  const sessionToken = await requireMasterAdminSessionToken();
  const playerId = requireFormId<"players">(
    formData,
    "playerId",
    "/admin/players?error=invalid-player",
  );

  const client = getConvexClient();
  try {
    await client.mutation(api.players.removePlayer, {
      sessionToken,
      playerId,
    });
  } catch (error) {
    redirect(
      `/admin/players?error=${encodeURIComponent(mutationErrorMessage(error, "Could not remove Player"))}`,
    );
  }

  redirect("/admin/players?removed=1");
}
