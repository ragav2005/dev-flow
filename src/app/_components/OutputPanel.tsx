"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Copy,
  Terminal,
} from "lucide-react";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import RunningCodeSkeleton from "./RunningCodeSkeleton";
import { ToastViewport, ToastData } from "./Toast";
import { createClient } from "@/utils/supabase/client";

const OutputPanel = () => {
  const supabase = createClient();
  const { output, error, isRunning } = useCodeEditorStore();
  const [isCopied, setIsCopied] = useState(false);
  const [user, setUser] = useState<Awaited<
    ReturnType<typeof supabase.auth.getUser>
  > | null>(null);
  const hasContent = output || error;

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
  const handleCopy = async () => {
    if (!hasContent) return;
    await navigator.clipboard.writeText(output || error || "");
    setIsCopied(true);

    setTimeout(() => setIsCopied(false), 2000);
  };

  useEffect(() => {
    const getUser = async () => {
      const user_data = await supabase.auth.getUser();
      setUser(user_data);
    };
    getUser();
  }, [supabase.auth]);

  useEffect(() => {
    if (output) {
      pushToast({ message: "Code executed successfully", variant: "success" });
    } else if (error) {
      pushToast({ message: "Error occured in execution", variant: "error" });
    }
  }, [error, output, pushToast]);
  return (
    <>
      <div className="relative bg-[#181825] rounded-xl p-4 ring-1 ring-gray-800/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#1e1e2e] ring-1 ring-gray-800/50">
              <Terminal className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-sm font-medium text-gray-300">Output</span>
          </div>

          {hasContent && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-400 hover:text-gray-300 bg-[#1e1e2e] 
            rounded-lg ring-1 ring-gray-800/50 hover:ring-gray-700/50 transition-all cursor-pointer"
            >
              {isCopied ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </>
              )}
            </button>
          )}
        </div>

        <div className="relative">
          <div
            className="relative bg-[#1e1e2e]/50 backdrop-blur-sm border border-[#313244] 
        rounded-xl p-4 h-[600px] overflow-auto font-mono text-sm"
          >
            {isRunning ? (
              <RunningCodeSkeleton />
            ) : error ? (
              <div className="flex items-start gap-3 text-red-400">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-1" />
                <div className="space-y-1">
                  <div className="font-medium">Execution Error</div>
                  <pre className="whitespace-pre-wrap text-red-400/80">
                    {error}
                  </pre>
                </div>
              </div>
            ) : output ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 mb-3">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">
                    {user?.data.user
                      ? "Execution Successful"
                      : "Execution Successful and Please SignIn to save executions"}
                  </span>
                </div>
                <pre className="whitespace-pre-wrap text-gray-300">
                  {output}
                </pre>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-800/50 ring-1 ring-gray-700/50 mb-4">
                  <Clock className="w-6 h-6" />
                </div>
                <p className="text-center">
                  Run your code to see the output here...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute top-0 inset-x-0 mt-2 z-30 flex items-center justify-center">
        <div className="pointer-events-auto max-w-md w-full px-4">
          <ToastViewport toasts={toasts} onClose={dismissToast} />
        </div>
      </div>
    </>
  );
};

export default OutputPanel;
