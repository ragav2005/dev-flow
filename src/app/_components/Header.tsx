export const dynamic = "force-dynamic";
export const revalidate = 0;
import React from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

import ClientAuthControls from "../_components/auth/ClientAuthControls";
import { getDisplayName } from "@/utils/auth/display";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const displayName = getDisplayName(user);

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
