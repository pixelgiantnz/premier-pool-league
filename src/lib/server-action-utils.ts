import { redirect } from "next/navigation";
import type { Id, TableNames } from "../../convex/_generated/dataModel";
import { parseConvexId } from "./convex-ids";
import { getSessionToken } from "./session";

export function mutationErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export async function requireMasterAdminSessionToken(): Promise<string> {
  const token = await getSessionToken();
  if (!token) redirect("/admin/login");
  return token;
}

export function requireFormId<TableName extends TableNames>(
  formData: FormData,
  field: string,
  errorRedirect: string,
): Id<TableName> {
  const id = parseConvexId<TableName>(String(formData.get(field) ?? ""));
  if (!id) redirect(errorRedirect);
  return id;
}
