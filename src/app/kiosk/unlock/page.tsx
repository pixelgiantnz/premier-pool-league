import { redirect } from "next/navigation";
import {
  AuthPanel,
  Field,
  SubmitButton,
} from "@/components/auth-panel";
import { upgradeToKioskAction } from "@/app/actions/auth";
import { getCurrentAccessTier } from "@/lib/session";

export default async function KioskUnlockPage() {
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
      <form action={upgradeToKioskAction} className="space-y-4">
        <Field
          label="Kiosk password"
          name="kioskPassword"
          type="password"
          autoComplete="current-password"
        />
        <SubmitButton label="Unlock Kiosk mode" />
      </form>
    </AuthPanel>
  );
}
