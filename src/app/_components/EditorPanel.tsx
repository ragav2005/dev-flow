"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { RotateCcwIcon, ShareIcon, TypeIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Editor } from "@monaco-editor/react";
import { defineMonacoThemes, LANGUAGE_CONFIG } from "../_constants";
import { ToastViewport, ToastData } from "./Toast";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import ShareSnippetsDialog from "./ShareSnippetsDialog";
import { createClient } from "@/utils/supabase/client";

const EditorPanel = () => {
  const supabase = createClient();
  const [user, setUser] = useState<Awaited<
    ReturnType<typeof supabase.auth.getUser>
  > | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const { language, theme, fontSize, editor, setFontSize, setEditor } =
    useCodeEditorStore();
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

  const handleRefresh = () => {
    const defaultCode = LANGUAGE_CONFIG[language].defaultCode;
    if (editor) editor.setValue(defaultCode);
    localStorage.removeItem(`editor-code-${language}`);
    pushToast({ message: "Reset to default code", variant: "info" });
  };

  const handleEditorChange = (value: string | undefined) => {
    if (editor && value !== undefined) {
      localStorage.setItem(`editor-code-${language}`, value);
    }
  };

  const handleFontSizeChange = (newSize: number) => {
    const size = Math.min(Math.max(newSize, 12), 24);
    setFontSize(size);
    localStorage.setItem("editor-font-size", size.toString());
  };

  const handleShare = () => {
    if (user?.data.user) {
      setIsShareDialogOpen(true);
    } else {
      pushToast({ message: "Sign in to share snippets", variant: "error" });
    }
  };
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const savedCode = localStorage.getItem(`editor-code-${language}`);
    const newCode = savedCode || LANGUAGE_CONFIG[language].defaultCode;

    if (editor) editor.setValue(newCode);
  }, [language, editor]);

  useEffect(() => {
    const savedFontSize = localStorage.getItem("editor-font-size");
    if (savedFontSize) setFontSize(parseInt(savedFontSize));
  }, [setFontSize]);

  useEffect(() => {
    const getUser = async () => {
      const user_data = await supabase.auth.getUser();
      setUser(user_data);
    };
    getUser();
  }, [supabase.auth]);

  if (!mounted) return;

  return (
    <>
      <div className="relative">
        <div className="relative bg-[#12121a]/90 backdrop-blur rounded-xl border border-white/[0.05] p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1e1e2e] ring-1 ring-white/5">
                <Image
                  src={"/" + language + ".png"}
                  alt="Logo"
                  width={24}
                  height={24}
                />
              </div>
              <div>
                <h2 className="text-sm font-medium text-white">Code Editor</h2>
                <p className="text-xs text-gray-500">
                  Write and execute your code
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 px-3 py-2 bg-[#1e1e2e] rounded-lg ring-1 ring-white/5">
                <TypeIcon className="size-4 text-gray-400" />
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="12"
                    max="24"
                    value={fontSize}
                    onChange={(e) =>
                      handleFontSizeChange(parseInt(e.target.value))
                    }
                    className="w-20 h-1 bg-gray-600 rounded-lg cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-400 min-w-[2rem] text-center">
                    {fontSize}
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className="p-2 bg-[#1e1e2e] hover:bg-[#2a2a3a] rounded-lg ring-1 ring-white/5 transition-colors cursor-pointer"
                aria-label="Reset to default code"
              >
                <RotateCcwIcon className="size-4 text-gray-400" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg overflow-hidden bg-gradient-to-r
               from-blue-500 to-blue-600 opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <ShareIcon className="size-4 text-white" />
                <span className="text-sm font-medium text-white ">Share</span>
              </motion.button>
            </div>
          </div>

          {/* Editor */}

          <div className="relative group rounded-xl overflow-hidden ring-1 ring-white/[0.05]">
            <Editor
              height="600px"
              language={LANGUAGE_CONFIG[language].monacoLanguage}
              onChange={handleEditorChange}
              theme={theme}
              beforeMount={defineMonacoThemes}
              onMount={(editor) => setEditor(editor)}
              options={{
                minimap: { enabled: false },
                fontSize,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                renderWhitespace: "selection",
                fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
                fontLigatures: true,
                cursorBlinking: "smooth",
                smoothScrolling: true,
                contextmenu: true,
                renderLineHighlight: "all",
                lineHeight: 1.6,
                letterSpacing: 0.5,
                roundedSelection: true,
                scrollbar: {
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                },
              }}
            />
          </div>
        </div>
        {isShareDialogOpen && (
          <ShareSnippetsDialog
            onClose={() => setIsShareDialogOpen(false)}
            onSuccess={({ title }) => {
              pushToast({
                message: `Snippet ${title} was saved`,
                variant: "success",
              });
            }}
            onError={() => {
              pushToast({
                message: "Could not save snippet",
                variant: "error",
              });
            }}
          />
        )}
      </div>
      <div className="pointer-events-none absolute top-0 inset-x-0 mt-2 z-30 flex items-center justify-center">
        <div className="pointer-events-auto max-w-md w-full px-4">
          <ToastViewport toasts={toasts} onClose={dismissToast} />
        </div>
      </div>
    </>
  );
};
export default EditorPanel;
