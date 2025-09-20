"use client";
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface Props {
  initialHasUser: boolean;
  initialDisplayName: string | null;
}

export default function ClientAuthControls({
  initialHasUser,
  initialDisplayName,
}: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [hasUser, setHasUser] = useState(initialHasUser);
  const [name, setName] = useState<string | null>(initialDisplayName);
  const [checked, setChecked] = useState(initialHasUser);
  const [signingOut, startSignOut] = useTransition();

  useEffect(() => {
    if (initialHasUser) return;
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      if (data.user) {
        const displayName =
          (data.user.user_metadata?.full_name as string) ||
          (data.user.user_metadata?.name as string) ||
          data.user.email ||
          null;
        setName(displayName);
        setHasUser(true);
      }
      setChecked(true);
    })();
    return () => {
      active = false;
    };
  }, [initialHasUser, supabase]);

  function handleSignOut() {
    startSignOut(async () => {
      try {
        await supabase.auth.signOut();
      } catch {}
      router.replace("/signin");
      router.refresh();
    });
  }

  if (hasUser) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-300" aria-live="polite">
          {name}
        </span>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="px-4 py-1.5 rounded-md text-sm font-medium bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-100 transition"
        >
          {signingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    );
  }

  if (!checked) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400 animate-pulse">
          Finalizing login...
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/signin"
        className="px-4 py-1.5 rounded-md text-sm font-medium bg-gray-700 hover:bg-gray-600 text-gray-100 transition"
      >
        Sign in
      </Link>
      <Link
        href="/signup"
        className="px-4 py-1.5 rounded-md text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white transition"
      >
        Sign up
      </Link>
    </div>
  );
}
