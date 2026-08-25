import { redirect } from "next/navigation";
import {
  AuthPanel,
  Field,
  SubmitButton,
} from "@/components/auth-panel";
import { bootstrapMasterAdminAction } from "@/app/actions/auth";
import { hasMasterAdminAccount } from "@/lib/convex-server";

export default async function AdminRegisterPage() {
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
      subtitle="First-time setup for the Platform. You will configure Platform and Kiosk passwords next."
    >
      <form action={bootstrapMasterAdminAction} className="space-y-4">
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
        />
        <SubmitButton label="Create Master Admin" />
      </form>
    </AuthPanel>
  );
}
