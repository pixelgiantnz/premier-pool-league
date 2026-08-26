import { redirect } from "next/navigation";
import {
  AuthForm,
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

export default async function GatePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
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
      {params.error && (
        <p className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
          {params.error}
        </p>
      )}
      <AuthForm action={signInWithPlatformPasswordAction}>
        <Field
          label="Platform password"
          name="password"
          type="password"
          autoComplete="current-password"
        />
        <SubmitButton label="Continue as Viewer" />
      </AuthForm>
      <p className="mt-6 text-center text-sm text-white/50">
        <Link href="/admin/login" className="text-[var(--accent)] hover:underline">
          Master Admin sign in
        </Link>
      </p>
    </AuthPanel>
  );
}
