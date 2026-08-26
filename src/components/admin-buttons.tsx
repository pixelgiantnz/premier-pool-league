"use client";

import { useFormStatus } from "react-dom";
import { signOutAction } from "@/app/actions/auth";
import { ActionButton } from "@/components/action-form";

export function SignOutButton() {
  return (
    <form action={signOutAction} suppressHydrationWarning>
      <ActionButton
        label="Sign out"
        pendingLabel="Signing out…"
        className="rounded-full border border-white/15 px-3 py-1 text-sm text-white/70 hover:text-white"
      />
    </form>
  );
}

function DeleteLeagueButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="rounded-xl border border-red-400/30 px-3 py-1 text-sm text-red-200 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Deleting…" : "Delete League"}
    </button>
  );
}

export function DeleteLeagueForm({
  action,
  leagueId,
}: {
  action: (formData: FormData) => void | Promise<void>;
  leagueId: string;
}) {
  return (
    <form action={action} suppressHydrationWarning>
      <input type="hidden" name="leagueId" value={leagueId} />
      <DeleteLeagueButton />
    </form>
  );
}
