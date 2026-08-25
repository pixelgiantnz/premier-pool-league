import { redirect } from "next/navigation";
import {
  AuthPanel,
  Field,
  SubmitButton,
} from "@/components/auth-panel";
import { signInWithPlatformPasswordAction } from "@/app/actions/auth";
import {
  hasMasterAdminAccount,
  platformPasswordsConfigured,
} from "@/lib/convex-server";
import Link from "next/link";

export default async function GatePage() {
  let configured = false;
  let hasAdmin = false;

  try {
    configured = await platformPasswordsConfigured();
    hasAdmin = await hasMasterAdminAccount();
  } catch {
    return (
      <AuthPanel
        title="Convex not linked"
        subtitle="Run `npx convex dev` in the project root, then reload this page."
      >
        <p className="text-sm text-white/70">
          The app needs a Convex deployment before Platform password sign-in
          works.
        </p>
      </AuthPanel>
    );
  }

  if (!hasAdmin) {
    redirect("/admin/register");
  }

  if (!configured) {
    redirect("/admin/login?setup=passwords");
  }

  return (
    <AuthPanel
      title="Enter Platform password"
      subtitle="Viewer access to Leagues across the Platform. Use the Kiosk password later to record Shots at the table."
    >
      <form action={signInWithPlatformPasswordAction} className="space-y-4">
        <Field
          label="Platform password"
          name="password"
          type="password"
          autoComplete="current-password"
        />
        <SubmitButton label="Continue as Viewer" />
      </form>
      <p className="mt-6 text-center text-sm text-white/50">
        <Link href="/admin/login" className="text-[var(--accent)] hover:underline">
          Master Admin sign in
        </Link>
      </p>
    </AuthPanel>
  );
}
