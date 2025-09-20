import { createClient } from "@/utils/supabase/server";
import { mirrorUser } from "@/utils/auth/mirror";

export default async function UserBootstrap() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  try {
    const result = await mirrorUser({
      user: {
        id: user.id,
        email: user.email ?? null,
        user_metadata: user.user_metadata,
      },
      client: supabase,
    });
    if (result.error) {
      console.error("[UserBootstrap] mirrorUser failed", result.error);
    }
  } catch (e) {
    console.error("[UserBootstrap] unexpected mirror error", e);
  }
  return null;
}
