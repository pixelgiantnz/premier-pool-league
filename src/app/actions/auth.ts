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

export async function bootstrapMasterAdminAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const client = getConvexClient();
  await client.mutation(api.auth.bootstrapMasterAdmin, { email, password });
  redirect("/admin/login?registered=1");
}

export async function signInMasterAdminAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const client = getConvexClient();
  const result = await client.mutation(api.auth.signInMasterAdmin, {
    email,
    password,
  });
  await setSessionCookie(result.token);
  redirect("/admin/settings");
}

export async function signInWithPlatformPasswordAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const client = getConvexClient();
  const result = await client.mutation(api.auth.signInWithPlatformPassword, {
    password,
  });
  await setSessionCookie(result.token);
  redirect("/");
}

export async function upgradeToKioskAction(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) redirect("/gate");

  const kioskPassword = String(formData.get("kioskPassword") ?? "");
  const client = getConvexClient();
  await client.mutation(api.auth.upgradeSessionToKiosk, {
    sessionToken: token,
    kioskPassword,
  });
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
