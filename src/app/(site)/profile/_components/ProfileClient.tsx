"use client";
import { createClient } from "@/utils/supabase/client";
import React, { useEffect, useState, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import ProfileHeaderSkeleton from "./ProfileHeaderSkeleton";
import ProfileHeader from "./ProfileHeader";
import { TABS } from "@/app/_constants";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import CodeBlock from "./CodeBlock";
import { ChevronRight, Clock, Code, Loader2, Star } from "lucide-react";
import Link from "next/link";

export interface UserStats {
  totalExecutions: number;
  executions24h: number;
  starredSnippets: number;
  mostStarredLanguage: string | null;
  languagesUsed: number;
  mostUsedLanguage: string | null;
}

interface CodeExecution {
  id: string;
  userId: string;
  code: string;
  output: string;
  error: string | null;
  language: string;
  created_at: string;
}

interface Snippet {
  id: string;
  userId: string;
  title: string;
  code: string;
  language: string;
  created_at: string;
  name: string;
  starCount: number;
}

const ProfileClient = () => {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [codeExecutions, setCodeExecutions] = useState<CodeExecution[]>([]);
  const [starredSnippets, setStarredSnippets] = useState<Snippet[]>([]);
  const [activeTab, setActiveTab] = useState<"executions" | "starred">(
    "executions"
  );

  const fetchStarredSnippets = useCallback(
    async (userId: string) => {
      try {
        const { data: starredRecords, error: starsError } = await supabase
          .from("stars")
          .select("snippetId")
          .eq("userId", userId);

        if (starsError) {
          console.error("Error fetching starred records:", starsError);
          return;
        }

        if (starredRecords && starredRecords.length > 0) {
          const snippetIds = starredRecords.map((record) => record.snippetId);
          const { data: snippets, error: snippetsError } = await supabase
            .from("snippets")
            .select("*")
            .in("id", snippetIds)
            .order("created_at", { ascending: false });

          if (snippetsError) {
            console.error("Error fetching snippets:", snippetsError);
            return;
          }
          console.log(snippets);
          setStarredSnippets(snippets);
        } else {
          setStarredSnippets([]);
        }
      } catch (error) {
        console.error("Error fetching starred snippets:", error);
        setStarredSnippets([]);
      }
    },
    [supabase]
  );

  const fetchUserStats = useCallback(
    async (userId: string) => {
      try {
        // total executions
        const { count: totalExecutions } = await supabase
          .from("codeExecutions")
          .select("*", { count: "exact", head: true })
          .eq("userId", userId);

        //executions in 24h
        const { count: executions24h } = await supabase
          .from("codeExecutions")
          .select("*", { count: "exact", head: true })
          .eq("userId", userId)
          .gte(
            "created_at",
            new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          );

        // no starred snippets
        const { count: starredSnippets } = await supabase
          .from("stars")
          .select("*", { count: "exact", head: true })
          .eq("userId", userId);

        // languages of most used
        const { data: snippets } = await supabase
          .from("snippets")
          .select("language")
          .eq("userId", userId);

        const languageStats =
          snippets?.reduce((acc, snippet) => {
            acc[snippet.language] = (acc[snippet.language] || 0) + 1;
            return acc;
          }, {} as Record<string, number>) || {};

        const languagesUsed = Object.keys(languageStats).length;
        const mostUsedLanguage =
          languagesUsed > 0
            ? Object.entries(languageStats).sort(([, a], [, b]) => b - a)[0][0]
            : null;

        // most starred language
        const { data: starredSnippetIds } = await supabase
          .from("stars")
          .select("snippetId")
          .eq("userId", userId);

        if (starredSnippetIds && starredSnippetIds.length > 0) {
          const snippetIds = starredSnippetIds.map((s) => s.snippetId);
          const { data: starredSnippetsData } = await supabase
            .from("snippets")
            .select("language")
            .in("id", snippetIds);

          const starredLanguageStats =
            starredSnippetsData?.reduce((acc, snippet) => {
              acc[snippet.language] = (acc[snippet.language] || 0) + 1;
              return acc;
            }, {} as Record<string, number>) || {};

          const mostStarredLanguage =
            Object.keys(starredLanguageStats).length > 0
              ? Object.entries(starredLanguageStats).sort(
                  ([, a], [, b]) => b - a
                )[0][0]
              : null;

          setStats({
            totalExecutions: totalExecutions || 0,
            executions24h: executions24h || 0,
            starredSnippets: starredSnippets || 0,
            mostStarredLanguage,
            languagesUsed,
            mostUsedLanguage,
          });
        } else {
          setStats({
            totalExecutions: totalExecutions || 0,
            executions24h: executions24h || 0,
            starredSnippets: starredSnippets || 0,
            mostStarredLanguage: null,
            languagesUsed,
            mostUsedLanguage,
          });
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    },
    [supabase]
  );

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);

        try {
          await fetchUserStats(user.id);
          await fetchStarredSnippets(user.id);

          const { data, error } = await supabase
            .from("codeExecutions")
            .select("*")
            .eq("userId", user.id)
            .order("created_at", { ascending: false });

          if (data) {
            setCodeExecutions(data);
          }
          if (error) {
            console.log(error);
          }
        } catch (err) {
          console.log(err);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [supabase.auth, supabase, fetchUserStats, fetchStarredSnippets]);

  if (!user && !loading) {
    router.push("/");
    return;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {stats && user && <ProfileHeader userStats={stats} userData={user} />}

      {(stats === undefined || loading) && <ProfileHeaderSkeleton />}

      <div
        className="bg-gradient-to-br from-[#12121a] to-[#1a1a2e] rounded-3xl shadow-2xl 
        shadow-black/50 border border-gray-800/50 backdrop-blur-xl overflow-hidden"
      >
        <div className="border-b border-gray-800/50">
          <div className="flex space-x-1 p-4">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "executions" | "starred")}
                className={`group flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all duration-200 relative overflow-hidden cursor-pointer ${
                  activeTab === tab.id
                    ? "text-blue-400"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-blue-500/10 rounded-lg"
                    transition={{
                      type: "spring",
                      bounce: 0.2,
                      duration: 0.6,
                    }}
                  />
                )}
                <tab.icon className="w-4 h-4 relative z-10" />
                <span className="text-sm font-medium relative z-10">
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-6"
          >
            {activeTab === "executions" && (
              <div className="space-y-6">
                {codeExecutions?.map((execution) => (
                  <div
                    key={execution.id}
                    className="group rounded-xl overflow-hidden transition-all duration-300 hover:border-blue-500/50 hover:shadow-md hover:shadow-blue-500/50"
                  >
                    <div className="flex items-center justify-between p-4 bg-black/30 border border-gray-800/50 rounded-t-xl">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity" />
                          <Image
                            src={"/" + execution.language + ".png"}
                            alt=""
                            className="rounded-lg relative z-10 object-cover"
                            width={40}
                            height={40}
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">
                              {execution.language.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-400">
                              {new Date(execution.created_at).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                execution.error
                                  ? "bg-red-500/10 text-red-400"
                                  : "bg-green-500/10 text-green-400"
                              }`}
                            >
                              {execution.error ? "Error" : "Success"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-black/20 rounded-b-xl border border-t-0 border-gray-800/50">
                      <CodeBlock
                        code={execution.code}
                        language={execution.language}
                      />

                      {(execution.output || execution.error) && (
                        <div className="mt-4 p-4 rounded-lg bg-black/40">
                          <h4 className="text-sm font-medium text-gray-400 mb-2">
                            Output
                          </h4>
                          <pre
                            className={`text-sm ${
                              execution.error
                                ? "text-red-400"
                                : "text-green-400"
                            }`}
                          >
                            {execution.error || execution.output}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 text-gray-600 mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-medium text-gray-400 mb-2">
                      Loading code executions...
                    </h3>
                  </div>
                ) : (
                  codeExecutions.length === 0 && (
                    <div className="text-center py-12">
                      <Code className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-400 mb-2">
                        No code executions yet
                      </h3>
                      <p className="text-gray-500">
                        Start coding to see your execution history!
                      </p>
                    </div>
                  )
                )}
              </div>
            )}

            {activeTab === "starred" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {starredSnippets?.map((snippet) => (
                  <div key={snippet.id} className="group relative">
                    <Link href={`/snippets/${snippet.id}`}>
                      <div
                        className="bg-black/20 rounded-xl border border-gray-800/50 hover:border-gray-700/50 
                          transition-all duration-300 overflow-hidden h-full group-hover:transform
                        group-hover:scale-[1.02]"
                      >
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity" />
                                <Image
                                  src={`/${snippet.language}.png`}
                                  alt={`${snippet.language} logo`}
                                  className="relative z-10"
                                  width={40}
                                  height={40}
                                />
                              </div>
                              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-sm">
                                {snippet.language}
                              </span>
                            </div>
                          </div>
                          <h2 className="text-xl font-semibold text-white mb-3 line-clamp-1 group-hover:text-blue-400 transition-colors">
                            {snippet.title}
                          </h2>
                          <div className="flex items-center justify-between text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>
                                {new Date(
                                  snippet.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                        <div className="px-6 pb-6">
                          <div className="bg-black/30 rounded-lg p-4 overflow-hidden">
                            <pre className="text-sm text-gray-300 font-mono line-clamp-3">
                              {snippet.code}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}

                {(!starredSnippets || starredSnippets.length === 0) && (
                  <div className="col-span-full text-center py-12">
                    <Star className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-400 mb-2">
                      No starred snippets yet
                    </h3>
                    <p className="text-gray-500">
                      Start exploring and star the snippets you find useful!
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfileClient;
