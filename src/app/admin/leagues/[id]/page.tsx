import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AuthForm,
  Field,
  SubmitButton,
} from "@/components/auth-panel";
import { SessionBar } from "@/components/session-bar";
import {
  createPlayerAction,
  removePlayerAction,
  updatePlayerAction,
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
    saved?: string;
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
  let players: Array<{
    _id: Id<"players">;
    displayName: string;
    nickname: string;
    avatar: string;
    blurb?: string;
  }>;

  try {
    [league, players] = await Promise.all([
      client.query(api.leagues.getLeague, { sessionToken, leagueId }),
      client.query(api.players.listPlayersByLeague, { sessionToken, leagueId }),
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
        {queryParams.saved && (
          <p className="mt-4 rounded-xl bg-[var(--accent)]/10 px-4 py-3 text-sm text-[var(--accent)]">
            Player updated.
          </p>
        )}
        {queryParams.removed && (
          <p className="mt-4 rounded-xl bg-[var(--accent)]/10 px-4 py-3 text-sm text-[var(--accent)]">
            Player removed from the roster.
          </p>
        )}

        <section className="mt-8 rounded-3xl border border-white/10 bg-[var(--surface)] p-6">
          <h2 className="text-lg font-semibold">Add Player</h2>
          <AuthForm action={createPlayerAction} className="mt-6 space-y-4">
            <input type="hidden" name="leagueId" value={leagueId} />
            <Field label="Display name" name="displayName" autoComplete="off" />
            <Field label="Nickname" name="nickname" autoComplete="off" />
            <Field
              label="Avatar"
              name="avatar"
              autoComplete="off"
              defaultValue="🎱"
            />
            <Field label="Blurb (optional)" name="blurb" autoComplete="off" />
            <SubmitButton label="Add Player" />
          </AuthForm>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Roster</h2>
          {players.length === 0 ? (
            <p className="mt-3 text-sm text-white/50">
              No Players on this League yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {players.map((player) => (
                <li
                  key={player._id}
                  className="rounded-3xl border border-white/10 bg-[var(--surface)] p-6"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl" aria-hidden>
                      {player.avatar}
                    </span>
                    <div className="min-w-0 flex-1">
                      <AuthForm
                        action={updatePlayerAction}
                        className="space-y-3"
                      >
                        <input type="hidden" name="leagueId" value={leagueId} />
                        <input
                          type="hidden"
                          name="playerId"
                          value={player._id}
                        />
                        <div className="grid gap-3 md:grid-cols-2">
                          <Field
                            label="Display name"
                            name="displayName"
                            defaultValue={player.displayName}
                          />
                          <Field
                            label="Nickname"
                            name="nickname"
                            defaultValue={player.nickname}
                          />
                          <Field
                            label="Avatar"
                            name="avatar"
                            defaultValue={player.avatar}
                          />
                          <Field
                            label="Blurb (optional)"
                            name="blurb"
                            defaultValue={player.blurb ?? ""}
                          />
                        </div>
                        <SubmitButton label="Save Player" />
                      </AuthForm>
                      <AuthForm
                        action={removePlayerAction}
                        className="mt-3"
                      >
                        <input type="hidden" name="leagueId" value={leagueId} />
                        <input
                          type="hidden"
                          name="playerId"
                          value={player._id}
                        />
                        <button
                          type="submit"
                          className="rounded-xl border border-red-400/30 px-4 py-2 text-sm text-red-200 hover:bg-red-400/10"
                        >
                          Remove Player
                        </button>
                      </AuthForm>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
