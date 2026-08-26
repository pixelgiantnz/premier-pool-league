import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AuthForm,
  AuthPanel,
  Field,
  SubmitButton,
} from "@/components/auth-panel";
import { resetMasterAdminPasswordAction } from "@/app/actions/auth";
import { hasMasterAdminAccount } from "@/lib/convex-server";

export default async function AdminResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; email?: string }>;
}) {
  const params = await searchParams;

  try {
    const hasAdmin = await hasMasterAdminAccount();
    if (!hasAdmin) {
      redirect("/admin/register");
    }
  } catch {
    return (
      <AuthPanel
        title="Convex not linked"
        subtitle="Run `npx convex dev` in the project root, then reload this page."
      >
        <p className="text-sm text-white/70">
          Password reset requires a linked Convex deployment.
        </p>
      </AuthPanel>
    );
  }

  const emailDefault = params.email ?? undefined;

  return (
    <AuthPanel
      title="Reset Master Admin password"
      subtitle="Requires the MASTER_ADMIN_RESET_SECRET set in your Convex deployment. This does not change Platform or Kiosk passwords."
    >
      {params.error && (
        <p className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
          {params.error}
        </p>
      )}
      <AuthForm action={resetMasterAdminPasswordAction}>
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={emailDefault}
        />
        <Field
          label="New Master Admin password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
        />
        <Field
          label="Reset secret"
          name="resetSecret"
          type="password"
          autoComplete="off"
        />
        <SubmitButton label="Reset password and sign in" />
      </AuthForm>
      <p className="mt-6 text-center text-sm text-white/50">
        <Link href="/admin/login" className="text-[var(--accent)] hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthPanel>
  );
}
