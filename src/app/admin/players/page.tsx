import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm, ActionButton, SubmitButton } from "@/components/action-form";
import { Field } from "@/components/auth-panel";
import { SessionBar } from "@/components/session-bar";
import {
  createPlayerAction,
  removePlayerAction,
  updatePlayerAction,
} from "@/app/actions/players";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { tierAllowsMasterAdminActions } from "../../../../lib/auth/tiers";
import { getConvexClient } from "@/lib/convex-server";
import { getCurrentAccessTier, getSessionToken } from "@/lib/session";

export default async function AdminPlayersPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    created?: string;
    saved?: string;
    removed?: string;
  }>;
}) {
  const tier = await getCurrentAccessTier();
  const params = await searchParams;

  if (!tierAllowsMasterAdminActions(tier)) {
    redirect("/admin/login");
  }

  const sessionToken = await getSessionToken();
  if (!sessionToken) redirect("/admin/login");

  let players: Array<{
    _id: Id<"players">;
    displayName: string;
    nickname: string;
    avatar: string;
    blurb?: string;
  }> = [];

  try {
    const client = getConvexClient();
    players = await client.query(api.players.listAllPlayers, { sessionToken });
  } catch {
    return (
      <>
        <SessionBar tier={tier} />
        <main className="mx-auto max-w-4xl px-6 py-10">
          <p className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
            Could not load Players. Check that Convex is linked and deployed.
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <SessionBar tier={tier} />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
              Master Admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Player pool</h1>
            <p className="mt-2 max-w-2xl text-white/65">
              Platform-wide Players. Add them to individual League rosters from
              each League page.
            </p>
          </div>
          <Link
            href="/admin/leagues"
            className="text-sm text-[var(--accent)] hover:underline"
          >
            Leagues
          </Link>
        </div>

        {params.error && (
          <p className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
            {params.error}
          </p>
        )}
        {params.created && (
          <p className="mt-4 rounded-xl bg-[var(--accent)]/10 px-4 py-3 text-sm text-[var(--accent)]">
            Player added to the pool.
          </p>
        )}
        {params.saved && (
          <p className="mt-4 rounded-xl bg-[var(--accent)]/10 px-4 py-3 text-sm text-[var(--accent)]">
            Player updated.
          </p>
        )}
        {params.removed && (
          <p className="mt-4 rounded-xl bg-[var(--accent)]/10 px-4 py-3 text-sm text-[var(--accent)]">
            Player removed from the pool and all League rosters.
          </p>
        )}

        <section className="mt-8 rounded-3xl border border-white/10 bg-[var(--surface)] p-6">
          <h2 className="text-lg font-semibold">Add Player</h2>
          <AuthForm action={createPlayerAction} className="mt-6 space-y-4">
            <Field label="Display name" name="displayName" autoComplete="off" />
            <Field label="Nickname" name="nickname" autoComplete="off" />
            <Field
              label="Avatar"
              name="avatar"
              autoComplete="off"
              defaultValue="🎱"
            />
            <Field
              label="Blurb (optional)"
              name="blurb"
              autoComplete="off"
              required={false}
            />
            <SubmitButton label="Add Player" pendingLabel="Adding…" />
          </AuthForm>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">All Players</h2>
          {players.length === 0 ? (
            <p className="mt-3 text-sm text-white/50">
              No Players in the pool yet.
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
                            required={false}
                          />
                        </div>
                        <SubmitButton
                          label="Save Player"
                          pendingLabel="Saving…"
                        />
                      </AuthForm>
                      <AuthForm action={removePlayerAction} className="mt-3">
                        <input
                          type="hidden"
                          name="playerId"
                          value={player._id}
                        />
                        <ActionButton
                          label="Remove from pool"
                          pendingLabel="Removing…"
                          variant="danger"
                        />
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
