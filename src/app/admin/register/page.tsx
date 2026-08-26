import { redirect } from "next/navigation";
import {
  AuthForm,
  AuthPanel,
  Field,
  SubmitButton,
} from "@/components/auth-panel";
import { bootstrapMasterAdminAction } from "@/app/actions/auth";
import { hasMasterAdminAccount } from "@/lib/convex-server";

export default async function AdminRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  try {
    const hasAdmin = await hasMasterAdminAccount();
    if (hasAdmin) {
      redirect("/admin/login");
    }
  } catch {
    return (
      <AuthPanel
        title="Convex not linked"
        subtitle="Run `npx convex dev` in the project root, then reload this page."
      >
        <p className="text-sm text-white/70">
          Bootstrap the first Master Admin after Convex is linked.
        </p>
      </AuthPanel>
    );
  }

  return (
    <AuthPanel
      title="Create Master Admin"
      subtitle="This password is for Master Admin sign-in only. You will set separate Platform and Kiosk passwords in settings next."
    >
      {params.error && (
        <p className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
          {params.error}
        </p>
      )}
      <AuthForm action={bootstrapMasterAdminAction}>
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <Field
          label="Master Admin password"
          name="password"
          type="password"
          autoComplete="new-password"
        />
        <SubmitButton label="Create Master Admin" />
      </AuthForm>
    </AuthPanel>
  );
}
