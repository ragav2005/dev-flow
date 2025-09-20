"use client";
import { useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function SessionRefresh() {
  const ran = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const url = new URL(window.location.href);
    const hasCode = url.searchParams.has("code");
    const postLogin = url.searchParams.get("post_login") === "1";

    if (!hasCode && !postLogin) return;

    const supabase = createClient();

    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn("[SessionRefresh] getSession error", error.message);
        } else if (!data.session) {
          const retry = await supabase.auth.getSession();
          if (!retry.data.session) {
            console.warn("[SessionRefresh] No session after retry");
          }
        }
      } catch (e) {
        console.warn("[SessionRefresh] unexpected error", e);
      } finally {
        const cleanUrl = new URL(window.location.href);
        ["code", "post_login", "scope", "auth_type", "provider"].forEach((p) =>
          cleanUrl.searchParams.delete(p)
        );
        const newUrl = `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`;
        window.history.replaceState({}, "", newUrl);

        router.refresh();
      }
    })();
  }, [router]);

  return null;
}
