import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import {
  tierAllowsMasterAdminActions,
  upgradeTierWithKioskPassword,
  type AccessTier,
} from "../lib/auth/tiers";
import {
  createSessionToken,
  hashPassword,
  sessionExpiresAt,
  verifyPassword,
} from "./lib/password";

type DbCtx = QueryCtx | MutationCtx;

async function getSettings(ctx: DbCtx) {
  return ctx.db.query("platformSettings").first();
}

async function getSessionByTokenInternal(ctx: DbCtx, token: string) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .unique();

  if (!session || session.expiresAt < Date.now()) {
    return null;
  }

  return session;
}

async function requireMasterAdminSession(ctx: DbCtx, token: string) {
  const session = await getSessionByTokenInternal(ctx, token);
  if (
    !session ||
    !tierAllowsMasterAdminActions(session.tier as AccessTier)
  ) {
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
    return (
      settings?.platformPasswordHash !== undefined &&
      settings?.kioskPasswordHash !== undefined
    );
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
    const adminId = await ctx.db.insert("masterAdmins", {
      email: normalizedEmail,
      passwordHash: hashPassword(password),
    });

    const token = createSessionToken();
    await ctx.db.insert("sessions", {
      token,
      tier: "masterAdmin",
      masterAdminId: adminId,
      expiresAt: sessionExpiresAt(),
    });

    return { token, tier: "masterAdmin" as const, email: normalizedEmail };
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
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .unique();

    if (!admin || !verifyPassword(password, admin.passwordHash)) {
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

export const resetMasterAdminPassword = mutation({
  args: {
    email: v.string(),
    newPassword: v.string(),
    resetSecret: v.string(),
  },
  handler: async (ctx, { email, newPassword, resetSecret }) => {
    const expectedSecret = process.env.MASTER_ADMIN_RESET_SECRET;
    if (!expectedSecret) {
      throw new Error(
        "Master Admin reset is not configured. Set MASTER_ADMIN_RESET_SECRET in Convex.",
      );
    }
    if (resetSecret !== expectedSecret) {
      throw new Error("Invalid reset secret");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const admin = await ctx.db
      .query("masterAdmins")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .unique();

    if (!admin) {
      throw new Error("No Master Admin account found for that email");
    }

    if (newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    await ctx.db.patch(admin._id, {
      passwordHash: hashPassword(newPassword),
    });

    const sessions = await ctx.db.query("sessions").collect();
    for (const session of sessions) {
      if (tierAllowsMasterAdminActions(session.tier as AccessTier)) {
        await ctx.db.delete(session._id);
      }
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
    if (!settings?.platformPasswordHash) {
      throw new Error("Platform password is not configured yet");
    }

    if (!verifyPassword(password, settings.platformPasswordHash)) {
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

    const upgradedTier = upgradeTierWithKioskPassword(
      session.tier as AccessTier,
    );
    if (upgradedTier !== "kiosk" || session.tier !== "viewer") {
      throw new Error("Kiosk password requires a Viewer session first");
    }

    const settings = await getSettings(ctx);
    if (!settings?.kioskPasswordHash) {
      throw new Error("Kiosk password is not configured yet");
    }

    if (!verifyPassword(kioskPassword, settings.kioskPasswordHash)) {
      throw new Error("Invalid Kiosk password");
    }

    await ctx.db.patch(session._id, { tier: upgradedTier });

    return { tier: upgradedTier };
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

    const hash = hashPassword(newPassword);
    const settings = await getSettings(ctx);

    if (settings) {
      await ctx.db.patch(settings._id, { platformPasswordHash: hash });
    } else {
      await ctx.db.insert("platformSettings", { platformPasswordHash: hash });
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

    const hash = hashPassword(newPassword);
    const settings = await getSettings(ctx);

    if (settings) {
      await ctx.db.patch(settings._id, { kioskPasswordHash: hash });
    } else {
      await ctx.db.insert("platformSettings", { kioskPasswordHash: hash });
    }

    return { ok: true as const };
  },
});

export const signOut = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", sessionToken))
      .unique();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return { ok: true as const };
  },
});
