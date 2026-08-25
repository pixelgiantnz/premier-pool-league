import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  createSessionToken,
  hashPassword,
  sessionExpiresAt,
  verifyPassword,
} from "./lib/password";

async function getSettings(ctx: { db: { query: Function } }) {
  return ctx.db.query("platformSettings").first();
}

async function getSessionByTokenInternal(
  ctx: { db: { query: Function } },
  token: string,
) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: { eq: (a: string, b: string) => unknown }) =>
      q.eq("token", token),
    )
    .unique();

  if (!session || session.expiresAt < Date.now()) {
    return null;
  }

  return session;
}

async function requireMasterAdminSession(
  ctx: { db: { query: Function } },
  token: string,
) {
  const session = await getSessionByTokenInternal(ctx, token);
  if (!session || session.tier !== "masterAdmin") {
    throw new Error("Master Admin session required");
  }
  return session;
}

export const hasMasterAdmin = query({
  args: {},
  handler: async (ctx) => {
    const admin = await ctx.db.query("masterAdmins").first();
    return admin !== null;
  },
});

export const passwordsConfigured = query({
  args: {},
  handler: async (ctx) => {
    const settings = await getSettings(ctx);
    return settings !== null;
  },
});

export const getSessionByToken = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await getSessionByTokenInternal(ctx, token);
    if (!session) return null;
    return {
      tier: session.tier,
      expiresAt: session.expiresAt,
    };
  },
});

export const bootstrapMasterAdmin = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { email, password }) => {
    const existing = await ctx.db.query("masterAdmins").first();
    if (existing) {
      throw new Error("Master Admin already exists");
    }

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    const normalizedEmail = email.trim().toLowerCase();
    await ctx.db.insert("masterAdmins", {
      email: normalizedEmail,
      passwordHash: await hashPassword(password),
    });

    return { ok: true as const };
  },
});

export const signInMasterAdmin = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const admin = await ctx.db
      .query("masterAdmins")
      .withIndex("by_email", (q: { eq: (a: string, b: string) => unknown }) =>
        q.eq("email", normalizedEmail),
      )
      .unique();

    if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
      throw new Error("Invalid email or password");
    }

    const token = createSessionToken();
    await ctx.db.insert("sessions", {
      token,
      tier: "masterAdmin",
      masterAdminId: admin._id,
      expiresAt: sessionExpiresAt(),
    });

    return { token, tier: "masterAdmin" as const };
  },
});

export const signInWithPlatformPassword = mutation({
  args: { password: v.string() },
  handler: async (ctx, { password }) => {
    const settings = await getSettings(ctx);
    if (!settings) {
      throw new Error("Platform password is not configured yet");
    }

    if (!(await verifyPassword(password, settings.platformPasswordHash))) {
      throw new Error("Invalid Platform password");
    }

    const token = createSessionToken();
    await ctx.db.insert("sessions", {
      token,
      tier: "viewer",
      expiresAt: sessionExpiresAt(),
    });

    return { token, tier: "viewer" as const };
  },
});

export const upgradeSessionToKiosk = mutation({
  args: {
    sessionToken: v.string(),
    kioskPassword: v.string(),
  },
  handler: async (ctx, { sessionToken, kioskPassword }) => {
    const session = await getSessionByTokenInternal(ctx, sessionToken);
    if (!session) {
      throw new Error("Session expired or invalid");
    }

    if (session.tier !== "viewer") {
      throw new Error("Kiosk password requires a Viewer session first");
    }

    const settings = await getSettings(ctx);
    if (!settings) {
      throw new Error("Kiosk password is not configured yet");
    }

    if (!(await verifyPassword(kioskPassword, settings.kioskPasswordHash))) {
      throw new Error("Invalid Kiosk password");
    }

    await ctx.db.patch(session._id, { tier: "kiosk" });

    return { tier: "kiosk" as const };
  },
});

export const updatePlatformPassword = mutation({
  args: {
    sessionToken: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, { sessionToken, newPassword }) => {
    await requireMasterAdminSession(ctx, sessionToken);

    if (newPassword.length < 4) {
      throw new Error("Platform password must be at least 4 characters");
    }

    const hash = await hashPassword(newPassword);
    const settings = await getSettings(ctx);

    if (settings) {
      await ctx.db.patch(settings._id, { platformPasswordHash: hash });
    } else {
      const kioskHash = await hashPassword("changeme");
      await ctx.db.insert("platformSettings", {
        platformPasswordHash: hash,
        kioskPasswordHash: kioskHash,
      });
    }

    return { ok: true as const };
  },
});

export const updateKioskPassword = mutation({
  args: {
    sessionToken: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, { sessionToken, newPassword }) => {
    await requireMasterAdminSession(ctx, sessionToken);

    if (newPassword.length < 4) {
      throw new Error("Kiosk password must be at least 4 characters");
    }

    const hash = await hashPassword(newPassword);
    const settings = await getSettings(ctx);

    if (settings) {
      await ctx.db.patch(settings._id, { kioskPasswordHash: hash });
    } else {
      const platformHash = await hashPassword("changeme");
      await ctx.db.insert("platformSettings", {
        platformPasswordHash: platformHash,
        kioskPasswordHash: hash,
      });
    }

    return { ok: true as const };
  },
});

export const signOut = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q: { eq: (a: string, b: string) => unknown }) =>
        q.eq("token", sessionToken),
      )
      .unique();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return { ok: true as const };
  },
});
