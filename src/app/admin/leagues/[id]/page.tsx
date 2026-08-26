import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm, ActionButton, SubmitButton } from "@/components/action-form";
import { Field } from "@/components/auth-panel";
import { SessionBar } from "@/components/session-bar";
import {
  addPlayerToLeagueAction,
  removePlayerFromLeagueAction,
} from "@/app/actions/leagues";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { leagueFormatLabel } from "../../../../../lib/league/format";
import { tierAllowsMasterAdminActions } from "../../../../../lib/auth/tiers";
import { getConvexClient } from "@/lib/convex-server";
import { getCurrentAccessTier, getSessionToken } from "@/lib/session";

export default async function AdminLeagueRosterPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    added?: string;
    removed?: string;
  }>;
}) {
  const { id } = await params;
  const leagueId = id as Id<"leagues">;
  const queryParams = await searchParams;
  const tier = await getCurrentAccessTier();

  if (!tierAllowsMasterAdminActions(tier)) {
    redirect("/admin/login");
  }

  const sessionToken = await getSessionToken();
  if (!sessionToken) redirect("/admin/login");

  const client = getConvexClient();
  let league: {
    _id: Id<"leagues">;
    name: string;
    format: "singleRoundRobin" | "doubleRoundRobin";
    status: "active" | "past";
  };
  let roster: Array<{
    rosterId: Id<"leagueRosters">;
    _id: Id<"players">;
    displayName: string;
    nickname: string;
    avatar: string;
    blurb?: string;
  }>;
  let availablePlayers: Array<{
    _id: Id<"players">;
    displayName: string;
    nickname: string;
    avatar: string;
    blurb?: string;
  }>;

  try {
    [league, roster, availablePlayers] = await Promise.all([
      client.query(api.leagues.getLeague, { sessionToken, leagueId }),
      client.query(api.players.listRosterByLeague, { sessionToken, leagueId }),
      client.query(api.players.listAvailablePlayersForLeague, {
        sessionToken,
        leagueId,
      }),
    ]);
  } catch {
    redirect("/admin/leagues");
  }

  return (
    <>
      <SessionBar tier={tier} />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link
          href="/admin/leagues"
          className="text-sm text-[var(--accent)] hover:underline"
        >
          ← All Leagues
        </Link>

        <h1 className="mt-4 text-3xl font-semibold">{league.name}</h1>
        <p className="mt-2 text-white/65">
          {leagueFormatLabel(league.format)} ·{" "}
          {league.status === "active" ? "Active League" : "Past League"}
        </p>

        {queryParams.error && (
          <p className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
            {queryParams.error}
          </p>
        )}
        {queryParams.added && (
          <p className="mt-4 rounded-xl bg-[var(--accent)]/10 px-4 py-3 text-sm text-[var(--accent)]">
            Player added to the roster.
          </p>
        )}
        {queryParams.removed && (
          <p className="mt-4 rounded-xl bg-[var(--accent)]/10 px-4 py-3 text-sm text-[var(--accent)]">
            Player removed from the roster (still in the Platform pool).
          </p>
        )}

        <section className="mt-8 rounded-3xl border border-white/10 bg-[var(--surface)] p-6">
          <h2 className="text-lg font-semibold">Add from Player pool</h2>
          <p className="mt-2 text-sm text-white/60">
            Choose a Player from the Platform pool.{" "}
            <Link href="/admin/players" className="text-[var(--accent)] hover:underline">
              Manage the pool
            </Link>
          </p>
          {availablePlayers.length === 0 ? (
            <p className="mt-4 text-sm text-white/50">
              No available Players — create Players in the pool or all are
              already on this roster.
            </p>
          ) : (
            <AuthForm
              action={addPlayerToLeagueAction}
              className="mt-6 flex flex-wrap items-end gap-3"
            >
              <input type="hidden" name="leagueId" value={leagueId} />
              <label className="min-w-[16rem] flex-1">
                <span className="mb-2 block text-sm text-white/70">Player</span>
                <select
                  name="playerId"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none ring-[var(--accent)] focus:ring-2 disabled:opacity-60"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select a Player…
                  </option>
                  {availablePlayers.map((player) => (
                    <option key={player._id} value={player._id}>
                      {player.displayName} ({player.nickname})
                    </option>
                  ))}
                </select>
              </label>
              <SubmitButton
                label="Add to roster"
                pendingLabel="Adding…"
                className="mt-0 bg-[var(--accent)] px-5 py-3 text-black hover:brightness-110"
              />
            </AuthForm>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Roster</h2>
          {roster.length === 0 ? (
            <p className="mt-3 text-sm text-white/50">
              No Players on this League yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {roster.map((player) => (
                <li
                  key={player._id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[var(--surface)] px-5 py-4"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <span className="text-3xl" aria-hidden>
                      {player.avatar}
                    </span>
                    <div>
                      <p className="font-semibold">{player.displayName}</p>
                      <p className="text-sm text-white/55">{player.nickname}</p>
                      {player.blurb && (
                        <p className="mt-1 text-sm text-white/45">{player.blurb}</p>
                      )}
                    </div>
                  </div>
                  <AuthForm action={removePlayerFromLeagueAction}>
                    <input type="hidden" name="leagueId" value={leagueId} />
                    <input type="hidden" name="playerId" value={player._id} />
                    <ActionButton
                      label="Remove from roster"
                      pendingLabel="Removing…"
                      variant="danger"
                    />
                  </AuthForm>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
