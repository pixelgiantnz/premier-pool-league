import type { Id, TableNames } from "../../convex/_generated/dataModel";

const CONVEX_ID_PATTERN = /^[a-z0-9]{10,64}$/;

export function parseConvexId<TableName extends TableNames>(
  value: string,
): Id<TableName> | null {
  const trimmed = value.trim();
  if (!CONVEX_ID_PATTERN.test(trimmed)) {
    return null;
  }
  return trimmed as Id<TableName>;
}
