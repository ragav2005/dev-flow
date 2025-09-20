"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Github } from "lucide-react";

const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
  >
    <path
      fill="currentColor"
      d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.19,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.19,22C17.6,22 21.5,18.33 21.5,12.33C21.5,11.76 21.45,11.43 21.35,11.1Z"
    />
  </svg>
);

interface Props {
  redirectTo?: string;
  size?: "sm" | "md";
}

export default function OAuthButtons({ redirectTo = "/", size = "md" }: Props) {
  const supabase = createClient();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const baseClasses =
    "flex items-center justify-center gap-2 w-full bg-[#2A2D3A] hover:bg-[#383b49] text-gray-200 font-medium rounded-lg border border-gray-700 transition-colors cursor-pointer";
  const pad = size === "sm" ? "py-1.5 px-3 text-sm" : "py-2 px-4";

  async function handleProvider(provider: "google" | "github") {
    try {
      setLoadingProvider(provider);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}${redirectTo}?post_login=1`,
          queryParams:
            provider === "google" ? { prompt: "select_account" } : {},
        },
      });
      if (error) {
        alert(error.message);
      }
    } finally {
      setLoadingProvider(null);
    }
  }

  return (
    <div className="flex gap-4">
      <button
        type="button"
        disabled={!!loadingProvider}
        onClick={() => handleProvider("github")}
        className={`${baseClasses} ${pad} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <Github size={18} />
        {loadingProvider === "github" ? "Redirecting..." : "GitHub"}
      </button>
      <button
        type="button"
        disabled={!!loadingProvider}
        onClick={() => handleProvider("google")}
        className={`${baseClasses} ${pad} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <GoogleIcon />
        {loadingProvider === "google" ? "Redirecting..." : "Google"}
      </button>
    </div>
  );
}
