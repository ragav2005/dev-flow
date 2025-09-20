import { createClient } from "@/utils/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

interface SupabaseUserLike {
  id: string;
  email: string | null;
  user_metadata?: Record<string, unknown>;
}

interface UserMetaShape {
  full_name?: unknown;
  name?: unknown;
}

function extractName(meta?: Record<string, unknown>): string {
  if (!meta) return "";
  const m = meta as UserMetaShape;
  const cand = m.full_name ?? m.name;
  return typeof cand === "string" ? cand : "";
}

interface MirrorOptions {
  user: SupabaseUserLike;
  overrideName?: string | null;
  client?: SupabaseClient;
}

export async function mirrorUser({
  user,
  overrideName,
  client,
}: MirrorOptions) {
  if (!user) return { error: "no-user" } as const;
  const supabase = client ?? (await createClient());
  const fullName = (
    overrideName ||
    extractName(user.user_metadata) ||
    ""
  ).toString();
  const payload = {
    userId: user.id,
    email: user.email,
    name: fullName || null,
  };
  const { error } = await supabase
    .from("users")
    .upsert(payload as Record<string, unknown>, {
      onConflict: "userId",
    })
    .select("userId")
    .single();
  return { error: error?.message || null } as const;
}
