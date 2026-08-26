import { redirect } from "next/navigation";
import {
  AuthForm,
  SubmitButton,
} from "@/components/action-form";
import {
  AuthPanel,
  Field,
} from "@/components/auth-panel";
import { upgradeToKioskAction } from "@/app/actions/auth";
import { getCurrentAccessTier } from "@/lib/session";

export default async function KioskUnlockPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const tier = await getCurrentAccessTier();

  if (tier === "none") {
    redirect("/gate");
  }

  if (tier === "kiosk" || tier === "masterAdmin") {
    redirect("/");
  }

  return (
    <AuthPanel
      title="Unlock Kiosk"
      subtitle="Enter the Kiosk password to record Shots at the table. You already have Viewer access."
    >
      {params.error && (
        <p className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
          {params.error}
        </p>
      )}
      <AuthForm action={upgradeToKioskAction}>
        <Field
          label="Kiosk password"
          name="kioskPassword"
          type="password"
          autoComplete="current-password"
        />
        <SubmitButton label="Unlock Kiosk mode" />
      </AuthForm>
    </AuthPanel>
  );
}
