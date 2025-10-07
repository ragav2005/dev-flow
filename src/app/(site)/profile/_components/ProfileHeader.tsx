import React from "react";
import { User } from "@supabase/supabase-js";
import { UserStats } from "./ProfileClient";
import {
  Activity,
  Code2,
  Star,
  Timer,
  TrendingUp,
  Trophy,
  UserIcon,
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

const ProfileHeader = ({
  userStats,
  userData,
}: {
  userStats: UserStats;
  userData: User;
}) => {
  const STATS = [
    {
      label: "Code Executions",
      value: userStats?.totalExecutions ?? 0,
      icon: Activity,
      color: "from-blue-500 to-cyan-500",
      gradient: "group-hover:via-blue-400",
      description: "Total code runs",
      metric: {
        label: "Last 24h",
        value: userStats?.executions24h ?? 0,
        icon: Timer,
      },
    },
    {
      label: "Starred Snippets",
      value: userStats.starredSnippets ?? 0,
      icon: Star,
      color: "from-yellow-500 to-orange-500",
      gradient: "group-hover:via-yellow-400",
      description: "Saved for later",
      metric: {
        label: "Most starred",
        value: userStats?.mostStarredLanguage ?? "N/A",
        icon: Trophy,
      },
    },
    {
      label: "Languages Used",
      value: userStats?.languagesUsed ?? 0,
      icon: Code2,
      color: "from-purple-500 to-pink-500",
      gradient: "group-hover:via-purple-400",
      description: "Different languages",
      metric: {
        label: "Most used",
        value: userStats?.mostUsedLanguage ?? "N/A",
        icon: TrendingUp,
      },
    },
  ];
  return (
    <div
      className="relative mb-8 bg-gradient-to-br from-[#12121a] to-[#1a1a2e] rounded-2xl p-8 border
     border-gray-800/50 overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]" />
      <div className="relative flex items-center gap-8">
        <div className="relative group">
          <div
            className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full 
          blur-xl opacity-50 group-hover:opacity-75 transition-opacity"
          />
          <Image
            src={
              userData.user_metadata.avatar_url ||
              "https://avatars.githubusercontent.com/u/74288437?v=4"
            }
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-gray-800/50 relative z-10 group-hover:scale-105 transition-transform"
            width={24}
            height={24}
          />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">
              {userData.user_metadata.full_name}
            </h1>
          </div>
          <p className="text-gray-400 flex items-center gap-2">
            <UserIcon className="w-4 h-4" />
            {userData.email}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {STATS.map((stat, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            key={index}
            className="group relative bg-gradient-to-br from-black/40 to-black/20 rounded-2xl overflow-hidden"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 transition-all 
              duration-500 ${stat.gradient}`}
            />

            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-400">
                      {stat.description}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {typeof stat.value === "number"
                      ? stat.value.toLocaleString()
                      : stat.value}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
                </div>
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10`}
                >
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-800/50">
                <stat.metric.icon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400">
                  {stat.metric.label}:
                </span>
                <span className="text-sm font-medium text-white">
                  {stat.metric.value}
                </span>
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProfileHeader;
