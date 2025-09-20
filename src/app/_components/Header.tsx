export const dynamic = "force-dynamic";
export const revalidate = 0;
import React from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
// (redirect no longer needed; sign-out handled client side)
import ClientAuthControls from "../_components/auth/ClientAuthControls";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const displayName = user
    ? (user.user_metadata?.full_name as string) ||
      (user.user_metadata?.name as string) ||
      (user.email as string) ||
      null
    : null;
  // console.log('[Header] displayName', displayName);

  return (
    <header className="flex items-center justify-between py-3 mb-6">
      <Link href="/" className="text-xl font-semibold tracking-tight">
        DevFlow
      </Link>
      <ClientAuthControls
        initialHasUser={!!user}
        initialDisplayName={displayName}
      />
    </header>
  );
}
