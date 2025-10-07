"use client";
import React, { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import SnippetsPageSkeleton from "./SnippetsPageSkeleton";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Code, Grid, Layers, Search, Tag, X } from "lucide-react";
import Image from "next/image";
import SnippetCard from "./SnippetCard";
import { ToastViewport, ToastData } from "@/app/_components/Toast";
import type { User } from "@supabase/supabase-js";

export type Snippet = {
  id: number;
  title: string;
  language: string;
  created_at: string;
  userId: string;
  code: string;
  name: string;
  starCount?: number;
};

export default function SnippetsClient() {
  const supabase = createClient();
  const [snippets, setSnippets] = useState<Snippet[] | null>(null);
  const [starredIds, setStarredIds] = useState<Set<number>>(new Set());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const pushToast = useCallback((t: Omit<ToastData, "id">) => {
    setToasts((cur) => [
      ...cur,
      { id: crypto.randomUUID(), duration: 3000, variant: "info", ...t },
    ]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
  }, []);

  const languages = [...new Set((snippets ?? []).map((s) => s.language))];
  const popularLanguages = languages.slice(0, 5);

  const filteredSnippets = snippets?.filter((snippet) => {
    const matchesSearch =
      snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage =
      !selectedLanguage || snippet.language === selectedLanguage;

    return matchesSearch && matchesLanguage;
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);

      const { data, error } = await supabase
        .from("snippets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching snippets:", error.message);
        setError(error.message);
      } else {
        setSnippets(data);
      }

      if (user) {
        const { data: myStars, error: starsError } = await supabase
          .from("stars")
          .select("snippetId")
          .eq("userId", user.id);

        if (starsError) {
          console.error("Error fetching stars:", starsError.message);
        }

        if (myStars) {
          setStarredIds(new Set(myStars.map((s) => s.snippetId)));
        }
      }

      setIsLoading(false);
    };
    fetchData();
  }, [supabase]);

  const handleStarToggle = useCallback(
    async (snippetId: number, isCurrentlyStarred: boolean) => {
      if (!currentUser) {
        pushToast({ message: "Sign in to star snippets", variant: "error" });
        return;
      }

      setStarredIds((prev) => {
        const newSet = new Set(prev);
        if (isCurrentlyStarred) {
          newSet.delete(snippetId);
        } else {
          newSet.add(snippetId);
        }
        return newSet;
      });
      setSnippets(
        (prev) =>
          prev?.map((s) =>
            s.id === snippetId
              ? {
                  ...s,
                  starCount: (s.starCount || 0) + (isCurrentlyStarred ? -1 : 1),
                }
              : s
          ) || null
      );

      try {
        if (isCurrentlyStarred) {
          await supabase
            .from("stars")
            .delete()
            .eq("snippetId", snippetId)
            .eq("userId", currentUser.id);
          pushToast({ message: "Snippet unstarred", variant: "info" });
        } else {
          await supabase
            .from("stars")
            .insert({ snippetId, userId: currentUser.id });
          pushToast({ message: "Snippet starred!", variant: "success" });
        }
      } catch (err: unknown) {
        console.error("Star toggle error:", err);

        setStarredIds((prev) => {
          const newSet = new Set(prev);
          if (isCurrentlyStarred) {
            newSet.add(snippetId);
          } else {
            newSet.delete(snippetId);
          }
          return newSet;
        });

        setSnippets(
          (prev) =>
            prev?.map((s) =>
              s.id === snippetId
                ? {
                    ...s,
                    starCount:
                      (s.starCount || 0) + (isCurrentlyStarred ? 1 : -1),
                  }
                : s
            ) || null
        );

        pushToast({ message: "Failed to update star", variant: "error" });
      }
    },
    [currentUser, supabase, pushToast]
  );

  const handleDelete = useCallback(
    async (snippetId: number) => {
      if (!currentUser) return;

      try {
        const { error } = await supabase
          .from("snippets")
          .delete()
          .eq("id", snippetId)
          .eq("userId", currentUser.id);

        if (error) throw error;

        setSnippets((prev) => prev?.filter((s) => s.id !== snippetId) || null);
        pushToast({
          message: "Snippet deleted successfully",
          variant: "success",
        });
      } catch (err: unknown) {
        console.error("Delete error:", err);
        pushToast({ message: "Failed to delete snippet", variant: "error" });
      }
    },
    [currentUser, supabase, pushToast]
  );

  if (isLoading) {
    return <SnippetsPageSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="max-w-md w-full px-8 py-10 rounded-xl bg-[#1e1e2e] border border-[#313244] shadow-lg text-center">
          <div className="mb-4 flex justify-center">
            <X className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-100 mb-2">
            Error Occurred
          </h2>
          <p className="text-gray-400 mb-4">
            Sorry, we couldn&apos;t load the snippets. Please try again later.
          </p>
          <div className="bg-[#262637] rounded-lg px-4 py-2 text-sm text-red-400 mb-6">
            {error}
          </div>
          <button
            className="px-4 py-2 rounded-lg bg-blue-500/80 text-white font-semibold hover:bg-blue-600 transition cursor-pointer"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="relative max-w-7xl mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r
             from-blue-500/10 to-purple-500/10 text-sm text-gray-400 mb-6"
          >
            <BookOpen className="w-4 h-4" />
            Community Code Library
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-100 to-gray-300 text-transparent bg-clip-text mb-6"
          >
            Discover & Share Code Snippets
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-400 mb-8"
          >
            Explore a curated collection of code snippets from the community
          </motion.p>
        </div>

        <div className="relative max-w-5xl mx-auto mb-12 space-y-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search snippets by title, language, or author..."
                className="w-full pl-12 pr-4 py-4 bg-[#1e1e2e]/80 hover:bg-[#1e1e2e] text-white
                  rounded-xl border border-[#313244] hover:border-[#414155] transition-all duration-200
                  placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#1e1e2e] rounded-lg ring-1 ring-gray-800">
              <Tag className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Languages:</span>
            </div>

            {popularLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() =>
                  setSelectedLanguage(lang === selectedLanguage ? null : lang)
                }
                className={`
                    group relative px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer
                    ${
                      selectedLanguage === lang
                        ? "text-blue-400 bg-blue-500/10 ring-2 ring-blue-500/50"
                        : "text-gray-400 hover:text-gray-300 bg-[#1e1e2e] hover:bg-[#262637] ring-1 ring-gray-800"
                    }
                  `}
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={`/${lang}.png`}
                    alt={lang}
                    width={16}
                    height={16}
                    className="w-4 h-4 object-contain"
                  />
                  <span className="text-sm">{lang}</span>
                </div>
              </button>
            ))}

            {selectedLanguage && (
              <button
                onClick={() => setSelectedLanguage(null)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-300 transition-colors cursor-pointer bg-[#1e1e2e] hover:bg-[#262637] ring-1 ring-gray-800 rounded-lg"
              >
                Clear
                <X className="w-3 h-3" />
              </button>
            )}

            <div className="ml-auto flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {filteredSnippets?.length} snippets found
              </span>

              <div className="flex items-center gap-1 p-1 bg-[#1e1e2e] rounded-lg ring-1 ring-gray-800">
                <button
                  onClick={() => setView("grid")}
                  className={`p-2 rounded-md transition-all cursor-pointer ${
                    view === "grid"
                      ? "bg-blue-500/20 text-blue-400"
                      : "text-gray-400 hover:text-gray-300 hover:bg-[#262637] "
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-2 rounded-md transition-all cursor-pointer ${
                    view === "list"
                      ? "bg-blue-500/20 text-blue-400"
                      : "text-gray-400 hover:text-gray-300 hover:bg-[#262637]"
                  }`}
                >
                  <Layers className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          className={`grid gap-6 ${
            view === "grid"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1 max-w-3xl mx-auto"
          }`}
          layout
        >
          <AnimatePresence mode="popLayout">
            {filteredSnippets?.map((snippet) => (
              <SnippetCard
                key={snippet.id}
                snippet={snippet}
                currentUser={currentUser}
                isStarred={starredIds.has(snippet.id)}
                onStarToggle={handleStarToggle}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredSnippets?.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-md mx-auto mt-20 p-8 rounded-2xl overflow-hidden"
          >
            <div className="text-center">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br 
                from-blue-500/10 to-purple-500/10 ring-1 ring-white/10 mb-6"
              >
                <Code className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-white mb-3">
                No snippets found
              </h3>
              <p className="text-gray-400 mb-6">
                {searchQuery || selectedLanguage
                  ? "Try adjusting your search query or filters"
                  : "Be the first to share a code snippet with the community"}
              </p>

              {(searchQuery || selectedLanguage) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedLanguage(null);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#262637] text-gray-300 hover:text-white rounded-lg 
                    transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <div className="pointer-events-none fixed top-4 inset-x-0 z-50 flex items-center justify-center">
        <div className="pointer-events-auto max-w-md w-full px-4">
          <ToastViewport toasts={toasts} onClose={dismissToast} />
        </div>
      </div>
    </div>
  );
}
