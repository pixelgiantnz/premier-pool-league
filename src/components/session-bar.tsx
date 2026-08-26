import Link from "next/link";
import { accessTierLabel } from "../../lib/auth/tiers";
import type { AccessTier } from "../../lib/auth/tiers";
import { signOutAction } from "@/app/actions/auth";
import {
  tierAllowsKioskRecord,
  tierAllowsMasterAdminActions,
} from "../../lib/auth/tiers";

export function SessionBar({ tier }: { tier: AccessTier }) {
  return (
    <header className="border-b border-white/10 bg-black/20 px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
            Premier Pool League
          </p>
          <p className="text-sm text-white/70">
            Session: {accessTierLabel(tier)}
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/" className="text-white/80 hover:text-white">
            Home
          </Link>
          {tier === "viewer" && (
            <Link
              href="/kiosk/unlock"
              className="rounded-full border border-[var(--accent)]/40 px-3 py-1 text-[var(--accent)] hover:bg-[var(--accent)]/10"
            >
              Unlock Kiosk
            </Link>
          )}
          {tierAllowsMasterAdminActions(tier) && (
            <>
              <Link
                href="/admin/leagues"
                className="text-white/80 hover:text-white"
              >
                Leagues
              </Link>
              <Link
                href="/admin/settings"
                className="text-white/80 hover:text-white"
              >
                Settings
              </Link>
            </>
          )}
          {!tierAllowsMasterAdminActions(tier) && (
            <Link href="/admin/login" className="text-white/50 hover:text-white">
              Master Admin login
            </Link>
          )}
          {tierAllowsKioskRecord(tier) && (
            <span className="rounded-full bg-[var(--accent)]/15 px-3 py-1 text-[var(--accent)]">
              Kiosk ready
            </span>
          )}
          <form action={signOutAction} suppressHydrationWarning>
            <button
              type="submit"
              className="rounded-full border border-white/15 px-3 py-1 text-white/70 hover:text-white"
            >
              Sign out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
