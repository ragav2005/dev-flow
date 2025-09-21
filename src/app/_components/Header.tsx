export const dynamic = "force-dynamic";
export const revalidate = 0;
import React from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { CodeXml, Code } from "lucide-react";
import ClientAuthControls from "../_components/auth/ClientAuthControls";
import { getDisplayName } from "@/utils/auth/display";

import RunButton from "./RunButton";
import LanguageSelector from "./LanguageSelector";
import ThemeSelector from "./ThemeSelector";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const displayName = getDisplayName(user);
  const avatarUrl =
    (
      user?.user_metadata as
        | { avatar_url?: string; picture?: string }
        | undefined
    )?.avatar_url ||
    (
      user?.user_metadata as
        | { avatar_url?: string; picture?: string }
        | undefined
    )?.picture ||
    null;

  return (
    <div className="relative z-20 mb-6">
      <div className="flex items-center lg:justify-between justify-center bg-[#0a0a0f]/80 backdrop-blur-xl px-5 py-4 rounded-xl border border-white/5 shadow-lg">
        {/* Left: Brand + Nav (hidden on small screens) */}
        <div className="hidden lg:flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group relative">
            {/* Glow hover gradient (blue themed) */}
            <div className="absolute -inset-2 bg-gradient-to-r from-sky-500/20 via-cyan-400/10 to-blue-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl" />
            {/* Logo container */}
            <div className="relative bg-gradient-to-br from-[#132034] to-[#0b111a] p-2 rounded-xl ring-1 ring-white/10 group-hover:ring-sky-400/40 transition-all">
              <CodeXml className="size-6 text-sky-400 -rotate-6 group-hover:rotate-0 transition-transform duration-500" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg text-shadow-white font-semibold bg-gradient-to-r from-sky-300 via-cyan-200 to-blue-300  bg-clip-text tracking-tight">
                DevFlow
              </span>
              <span className="text-[10px] uppercase tracking-wider text-shadow-white font-medium">
                Your Code Studio
              </span>
            </div>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/"
              className="relative group flex items-center gap-2 px-4 py-1.5 rounded-lg text-gray-300 bg-gray-800/40 hover:bg-sky-600/10 border border-gray-800 hover:border-sky-500/40 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Code className="w-4 h-4 relative z-10 group-hover:rotate-3 transition-transform" />
              <span className="text-sm font-medium relative z-10 group-hover:text-white">
                Snippets
              </span>
            </Link>
          </nav>
        </div>

        {/* Auth Controls */}
        <div className="flex items-center gap-4">
          <div className="flex gap-5">
            <ThemeSelector />
            <LanguageSelector />
            <RunButton />
          </div>
          <div className="pl-4 ml-1 border-l border-gray-800">
            <ClientAuthControls
              initialHasUser={!!user}
              initialDisplayName={displayName}
              initialAvatar={avatarUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
