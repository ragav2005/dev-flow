"use client";
import React from "react";
import { Loader2, Play } from "lucide-react";
import { motion } from "framer-motion";
import {
  useCodeEditorStore,
  getExecutionResult,
} from "@/store/useCodeEditorStore";

import { createClient } from "@/utils/supabase/client";

export default function RunButton() {
  const supabase = createClient();
  const { isRunning, runCode, language } = useCodeEditorStore();

  const handleRun = async () => {
    await runCode();
    const user = await supabase.auth.getUser();

    if (user.data.user) {
      const userId = user.data.user.id;
      const result = getExecutionResult();
      const payload = {
        userId,
        language,
        code: result?.code,
        output: result?.output,
        error: result?.error,
      };

      try {
        const { error: insertError } = await supabase
          .from("codeExecutions")
          .insert([payload]);
        if (insertError) {
          console.log("Failed to log execution", insertError.message);
        }
      } catch (e) {
        console.log("Unexpected logging failure", e);
      }
    }
  };
  return (
    <motion.button
      onClick={handleRun}
      disabled={isRunning}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative inline-flex items-center gap-2.5 px-5 py-2.5 disabled:cursor-not-allowed focus:outline-none cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl opacity-100 transition-opacity group-hover:opacity-90" />
      <div className="relative flex items-center gap-2.5">
        {isRunning ? (
          <>
            <div className="relative">
              <Loader2 className="w-4 h-4 animate-spin text-white/70" />
              <div className="absolute inset-0 blur animate-pulse" />
            </div>
            <span className="text-sm font-medium text-white/90">
              Running...
            </span>
          </>
        ) : (
          <>
            <div className="relative flex items-center justify-center w-4 h-4">
              <Play className="w-4 h-4 text-white/90 transition-transform group-hover:scale-110 group-hover:text-white" />
            </div>
            <span className="text-sm font-medium text-white/90 group-hover:text-white">
              Run Code
            </span>
          </>
        )}
      </div>
    </motion.button>
  );
}
