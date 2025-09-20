import { createClient } from "@/utils/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getDisplayName } from "@/utils/auth/display";

interface SupabaseUserLike {
  id: string;
  email: string | null;
  user_metadata?: Record<string, unknown>;
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
    getDisplayName({
      email: (user.email ?? undefined) as string | undefined,
      user_metadata: user.user_metadata as Record<string, unknown> | undefined,
    }) ||
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
