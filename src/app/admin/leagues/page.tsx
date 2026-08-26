import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AuthForm,
  Field,
  SubmitButton,
} from "@/components/auth-panel";
import { SessionBar } from "@/components/session-bar";
import { createLeagueAction } from "@/app/actions/leagues";
import { api } from "../../../../convex/_generated/api";
import { leagueFormatLabel } from "../../../../lib/league/format";
import { tierAllowsMasterAdminActions } from "../../../../lib/auth/tiers";
import { getConvexClient } from "@/lib/convex-server";
import { getCurrentAccessTier, getSessionToken } from "@/lib/session";

export default async function AdminLeaguesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  const tier = await getCurrentAccessTier();
  const params = await searchParams;

  if (!tierAllowsMasterAdminActions(tier)) {
    redirect("/admin/login");
  }

  const sessionToken = await getSessionToken();
  if (!sessionToken) redirect("/admin/login");

  let leagues: Array<{
    _id: string;
    name: string;
    format: "singleRoundRobin" | "doubleRoundRobin";
    status: "active" | "past";
  }> = [];

  try {
    const client = getConvexClient();
    leagues = await client.query(api.leagues.listLeagues, { sessionToken });
  } catch {
    return (
      <>
        <SessionBar tier={tier} />
        <main className="mx-auto max-w-4xl px-6 py-10">
          <p className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
            Could not load Leagues. Check that Convex is linked and deployed.
          </p>
        </main>
      </>
    );
  }

  const activeLeagues = leagues.filter((league) => league.status === "active");
  const pastLeagues = leagues.filter((league) => league.status === "past");

  return (
    <>
      <SessionBar tier={tier} />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
              Master Admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Leagues</h1>
            <p className="mt-2 max-w-2xl text-white/65">
              Create Leagues and manage Player rosters. No fixture schedule is
              generated — Players choose opponents on the Kiosk (ADR-0001).
            </p>
          </div>
          <Link
            href="/admin/settings"
            className="text-sm text-[var(--accent)] hover:underline"
          >
            Platform settings
          </Link>
        </div>

        {params.error && (
          <p className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
            {params.error}
          </p>
        )}
        {params.created && (
          <p className="mt-4 rounded-xl bg-[var(--accent)]/10 px-4 py-3 text-sm text-[var(--accent)]">
            League created. Open it below to add Players.
          </p>
        )}

        <section className="mt-8 rounded-3xl border border-white/10 bg-[var(--surface)] p-6">
          <h2 className="text-lg font-semibold">Create League</h2>
          <AuthForm action={createLeagueAction} className="mt-6 space-y-4">
            <Field label="League name" name="name" autoComplete="off" />
            <label className="block">
              <span className="mb-2 block text-sm text-white/70">
                League format
              </span>
              <select
                name="format"
                required
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none ring-[var(--accent)] focus:ring-2"
                defaultValue="singleRoundRobin"
              >
                <option value="singleRoundRobin">
                  {leagueFormatLabel("singleRoundRobin")}
                </option>
                <option value="doubleRoundRobin">
                  {leagueFormatLabel("doubleRoundRobin")}
                </option>
              </select>
            </label>
            <SubmitButton label="Create League" />
          </AuthForm>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Active Leagues</h2>
          {activeLeagues.length === 0 ? (
            <p className="mt-3 text-sm text-white/50">
              No active Leagues yet. Create one above.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {activeLeagues.map((league) => (
                <li key={league._id}>
                  <Link
                    href={`/admin/leagues/${league._id}`}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-[var(--surface)] px-5 py-4 transition hover:border-[var(--accent)]/40"
                  >
                    <div>
                      <p className="font-semibold">{league.name}</p>
                      <p className="mt-1 text-sm text-white/55">
                        {leagueFormatLabel(league.format)}
                      </p>
                    </div>
                    <span className="text-sm text-[var(--accent)]">
                      Manage roster →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Past Leagues</h2>
          {pastLeagues.length === 0 ? (
            <p className="mt-3 text-sm text-white/50">
              No Past Leagues yet — they appear when every required Game is
              resolved.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {pastLeagues.map((league) => (
                <li key={league._id}>
                  <Link
                    href={`/admin/leagues/${league._id}`}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-[var(--surface)] px-5 py-4 transition hover:border-white/20"
                  >
                    <div>
                      <p className="font-semibold">{league.name}</p>
                      <p className="mt-1 text-sm text-white/55">Past League</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
