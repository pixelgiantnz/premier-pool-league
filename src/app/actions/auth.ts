"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { getConvexClient, SESSION_COOKIE } from "@/lib/convex-server";

const ONE_WEEK = 60 * 60 * 24 * 7;

async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_WEEK,
  });
}

async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

function mutationErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export async function bootstrapMasterAdminAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const client = getConvexClient();

  let result: { token: string };
  try {
    result = await client.mutation(api.auth.bootstrapMasterAdmin, {
      email,
      password,
    });
  } catch (error) {
    redirect(
      `/admin/register?error=${encodeURIComponent(mutationErrorMessage(error, "Registration failed"))}`,
    );
  }

  await setSessionCookie(result.token);
  redirect("/admin/settings?welcome=1");
}

export async function signInMasterAdminAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const client = getConvexClient();

  let result: { token: string };
  try {
    result = await client.mutation(api.auth.signInMasterAdmin, {
      email,
      password,
    });
  } catch {
    redirect(
      `/admin/login?error=invalid&email=${encodeURIComponent(email.trim().toLowerCase())}`,
    );
  }

  await setSessionCookie(result.token);
  redirect("/admin/settings");
}

export async function resetMasterAdminPasswordAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const resetSecret = String(formData.get("resetSecret") ?? "");
  const client = getConvexClient();

  let result: { token: string };
  try {
    result = await client.mutation(api.auth.resetMasterAdminPassword, {
      email,
      newPassword,
      resetSecret,
    });
  } catch (error) {
    redirect(
      `/admin/reset-password?error=${encodeURIComponent(mutationErrorMessage(error, "Password reset failed"))}&email=${encodeURIComponent(email.trim().toLowerCase())}`,
    );
  }

  await setSessionCookie(result.token);
  redirect("/admin/settings?reset=1");
}

export async function signInWithPlatformPasswordAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const client = getConvexClient();

  let result: { token: string };
  try {
    result = await client.mutation(api.auth.signInWithPlatformPassword, {
      password,
    });
  } catch (error) {
    redirect(
      `/gate?error=${encodeURIComponent(mutationErrorMessage(error, "Invalid Platform password"))}`,
    );
  }

  await setSessionCookie(result.token);
  redirect("/");
}

export async function upgradeToKioskAction(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) redirect("/gate");

  const kioskPassword = String(formData.get("kioskPassword") ?? "");
  const client = getConvexClient();

  try {
    await client.mutation(api.auth.upgradeSessionToKiosk, {
      sessionToken: token,
      kioskPassword,
    });
  } catch (error) {
    redirect(
      `/kiosk/unlock?error=${encodeURIComponent(mutationErrorMessage(error, "Invalid Kiosk password"))}`,
    );
  }

  redirect("/");
}

export async function updatePlatformPasswordAction(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) redirect("/admin/login");

  const newPassword = String(formData.get("platformPassword") ?? "");
  const client = getConvexClient();
  await client.mutation(api.auth.updatePlatformPassword, {
    sessionToken: token,
    newPassword,
  });
  redirect("/admin/settings?saved=platform");
}

export async function updateKioskPasswordAction(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) redirect("/admin/login");

  const newPassword = String(formData.get("kioskPassword") ?? "");
  const client = getConvexClient();
  await client.mutation(api.auth.updateKioskPassword, {
    sessionToken: token,
    newPassword,
  });
  redirect("/admin/settings?saved=kiosk");
}

export async function signOutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const client = getConvexClient();
    await client.mutation(api.auth.signOut, { sessionToken: token });
  }
  await clearSessionCookie();
  redirect("/gate");
}
