import { redirect } from "next/navigation";
import {
  Field,
  SubmitButton,
} from "@/components/auth-panel";
import { SessionBar } from "@/components/session-bar";
import {
  updateKioskPasswordAction,
  updatePlatformPasswordAction,
} from "@/app/actions/auth";
import { getCurrentAccessTier } from "@/lib/session";
import { tierAllowsMasterAdminActions } from "../../../../lib/auth/tiers";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const tier = await getCurrentAccessTier();
  const params = await searchParams;

  if (!tierAllowsMasterAdminActions(tier)) {
    redirect("/admin/login");
  }

  return (
    <>
      <SessionBar tier={tier} />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-semibold">Master Admin settings</h1>
        <p className="mt-2 text-white/65">
          Configure the Platform password (Viewer access) and Kiosk password
          (interactive Shot recording).
        </p>

        {params.saved === "platform" && (
          <p className="mt-4 rounded-xl bg-[var(--accent)]/10 px-4 py-3 text-sm text-[var(--accent)]">
            Platform password updated.
          </p>
        )}
        {params.saved === "kiosk" && (
          <p className="mt-4 rounded-xl bg-[var(--accent)]/10 px-4 py-3 text-sm text-[var(--accent)]">
            Kiosk password updated.
          </p>
        )}

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-[var(--surface)] p-6">
            <h2 className="text-lg font-semibold">Platform password</h2>
            <p className="mt-2 text-sm text-white/60">
              Grants Viewer access across the Platform after sign-in at the gate.
            </p>
            <form action={updatePlatformPasswordAction} className="mt-6 space-y-4">
              <Field
                label="New Platform password"
                name="platformPassword"
                type="password"
                autoComplete="new-password"
              />
              <SubmitButton label="Save Platform password" />
            </form>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[var(--surface)] p-6">
            <h2 className="text-lg font-semibold">Kiosk password</h2>
            <p className="mt-2 text-sm text-white/60">
              Unlocks Kiosk mode on a Viewer session so Shots can be recorded.
            </p>
            <form action={updateKioskPasswordAction} className="mt-6 space-y-4">
              <Field
                label="New Kiosk password"
                name="kioskPassword"
                type="password"
                autoComplete="new-password"
              />
              <SubmitButton label="Save Kiosk password" />
            </form>
          </section>
        </div>
      </main>
    </>
  );
}
