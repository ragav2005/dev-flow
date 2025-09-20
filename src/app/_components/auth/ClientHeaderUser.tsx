"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface Props {
  initialDisplayName: string | null;
}

export default function ClientHeaderUser({ initialDisplayName }: Props) {
  const [name, setName] = useState(initialDisplayName);

  useEffect(() => {
    if (name) return;
    let active = true;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      const user = data.user;
      if (user) {
        const displayName =
          (user.user_metadata?.full_name as string) ||
          (user.user_metadata?.name as string) ||
          user.email ||
          null;
        if (displayName) setName(displayName);
      }
    });
    return () => {
      active = false;
    };
  }, [name]);

  if (!name) {
    return (
      <span className="text-sm text-gray-400 animate-pulse" aria-live="polite">
        Signing you in...
      </span>
    );
  }
  return (
    <span className="text-sm text-gray-300" aria-live="polite">
      {name}
    </span>
  );
}
