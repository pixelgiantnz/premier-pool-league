import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AuthPanel,
  Field,
  SubmitButton,
} from "@/components/auth-panel";
import { signInMasterAdminAction } from "@/app/actions/auth";
import { hasMasterAdminAccount } from "@/lib/convex-server";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; setup?: string }>;
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

  return (
    <AuthPanel
      title="Master Admin sign in"
      subtitle="Manage Leagues, Players, Platform password, and Kiosk password."
    >
      {params.registered && (
        <p className="mb-4 rounded-xl bg-[var(--accent)]/10 px-4 py-3 text-sm text-[var(--accent)]">
          Master Admin account created. Sign in below.
        </p>
      )}
      {params.setup === "passwords" && (
        <p className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          Configure Platform and Kiosk passwords after sign-in.
        </p>
      )}
      <form action={signInMasterAdminAction} className="space-y-4">
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
        />
        <SubmitButton label="Sign in" />
      </form>
      <p className="mt-6 text-center text-sm text-white/50">
        <Link href="/gate" className="text-[var(--accent)] hover:underline">
          Back to Platform password gate
        </Link>
      </p>
    </AuthPanel>
  );
}
