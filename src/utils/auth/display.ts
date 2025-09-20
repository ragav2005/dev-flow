export function getDisplayName(
  user:
    | null
    | undefined
    | {
        email?: string | null;
        user_metadata?: Record<string, unknown> | null;
      }
): string | null {
  if (!user) return null;
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const candidates = [meta?.full_name, meta?.name, meta?.user_name, user.email];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  return null;
}
