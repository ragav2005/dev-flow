"use client";
import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { getDisplayName } from "@/utils/auth/display";

interface Props {
  initialHasUser: boolean;
  initialDisplayName: string | null;
  initialAvatar?: string | null;
}

const FALLBACK_AVATAR = "https://avatars.githubusercontent.com/u/74288437?v=4";

export default function ClientAuthControls({
  initialHasUser,
  initialDisplayName,
  initialAvatar,
}: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [hasUser, setHasUser] = useState(initialHasUser);
  const [name, setName] = useState<string | null>(initialDisplayName);
  const [checked, setChecked] = useState(initialHasUser);
  const [avatar, setAvatar] = useState<string | null>(initialAvatar || null);
  const [signingOut, startSignOut] = useTransition();

  useEffect(() => {
    if (initialHasUser) return;
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      if (data.user) {
        const dn = getDisplayName(data.user) || null;
        setName(dn);
        setHasUser(true);
        const meta = data.user.user_metadata as {
          avatar_url?: string;
          picture?: string;
        } | null;
        const url = meta?.avatar_url || meta?.picture || null;
        if (url) setAvatar(url);
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
        <div className="flex items-center gap-2">
          <Image
            src={avatar || FALLBACK_AVATAR}
            alt={name || "User avatar"}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10"
            referrerPolicy="no-referrer"
          />
          <span className="text-sm text-gray-300" aria-live="polite">
            {name}
          </span>
        </div>
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
    </div>
  );
}
