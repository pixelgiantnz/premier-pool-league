import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AuthForm,
  AuthPanel,
  Field,
  SubmitButton,
} from "@/components/auth-panel";
import { signInMasterAdminAction } from "@/app/actions/auth";
import { hasMasterAdminAccount } from "@/lib/convex-server";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    setup?: string;
    error?: string;
    email?: string;
  }>;
}) {
  const params = await searchParams;
  let hasAdmin = true;

  try {
    hasAdmin = await hasMasterAdminAccount();
  } catch {
    return (
      <AuthPanel
        title="Convex not linked"
        subtitle="Run `npx convex dev` in the project root, then reload this page."
      >
        <p className="text-sm text-white/70">
          Master Admin sign-in requires a linked Convex deployment.
        </p>
      </AuthPanel>
    );
  }

  if (!hasAdmin) {
    redirect("/admin/register");
  }

  const emailDefault = params.email ?? undefined;

  return (
    <AuthPanel
      title="Master Admin sign in"
      subtitle="Use the email and password from when you created the Master Admin account — not the Platform password from the gate."
    >
      {params.error === "invalid" && (
        <p className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
          Invalid email or password. Use your Master Admin registration
          credentials, not the Platform password you set in settings.
        </p>
      )}
      {params.setup === "passwords" && (
        <p className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          Configure Platform and Kiosk passwords after sign-in.
        </p>
      )}
      <AuthForm action={signInMasterAdminAction}>
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={emailDefault}
        />
        <Field
          label="Master Admin password"
          name="password"
          type="password"
          autoComplete="current-password"
        />
        <SubmitButton label="Sign in" />
      </AuthForm>
      <p className="mt-6 text-center text-sm text-white/50">
        <Link
          href={`/admin/reset-password${emailDefault ? `?email=${encodeURIComponent(emailDefault)}` : ""}`}
          className="text-[var(--accent)] hover:underline"
        >
          Forgot Master Admin password? Reset it
        </Link>
        <span className="mx-2 text-white/30">·</span>
        <Link href="/gate" className="text-[var(--accent)] hover:underline">
          Back to Platform password gate
        </Link>
      </p>
    </AuthPanel>
  );
}
