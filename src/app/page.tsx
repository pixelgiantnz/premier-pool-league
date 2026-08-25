import { redirect } from "next/navigation";
import { SessionBar } from "@/components/session-bar";
import { getCurrentAccessTier } from "@/lib/session";
import {
  tierAllowsKioskRecord,
  tierAllowsLeagueRead,
  tierAllowsMasterAdminActions,
} from "../../lib/auth/tiers";

export default async function HomePage() {
  const tier = await getCurrentAccessTier();

  if (!tierAllowsLeagueRead(tier)) {
    redirect("/gate");
  }

  return (
    <>
      <SessionBar tier={tier} />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
          League dashboard placeholder
        </p>
        <h1 className="mt-3 text-4xl font-semibold">Premier Pool League</h1>
        <p className="mt-4 max-w-2xl text-white/70">
          League content arrives in later tracer tickets. This page confirms
          your session tier and protects league routes behind authentication.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StatusCard
            label="Viewer access"
            active={tierAllowsLeagueRead(tier)}
          />
          <StatusCard
            label="Kiosk recording"
            active={tierAllowsKioskRecord(tier)}
          />
          <StatusCard
            label="Master Admin"
            active={tierAllowsMasterAdminActions(tier)}
          />
        </div>
      </main>
    </>
  );
}

function StatusCard({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[var(--surface)] p-5">
      <p className="text-sm text-white/60">{label}</p>
      <p
        className={`mt-2 text-lg font-semibold ${active ? "text-[var(--accent)]" : "text-white/35"}`}
      >
        {active ? "Enabled" : "Not enabled"}
      </p>
    </div>
  );
}
