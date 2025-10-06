"use client";
import { createClient } from "@/utils/supabase/client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import SnippetLoadingSkeleton from "./SnippetLoadingSkeleton";
import { Clock, Code, MessageSquare, User } from "lucide-react";
import Image from "next/image";
import { defineMonacoThemes, LANGUAGE_CONFIG } from "@/app/_constants";
import { Editor } from "@monaco-editor/react";
import CopyButton from "./CopyButton";
import Comments from "./Comments";

type Snippet = {
  id: number;
  title: string;
  language: string;
  code: string;
  name: string;
  userId: string;
  starCount: number;
  created_at: string;
};
const SnippetPage = () => {
  const id = useParams().id;
  const supabase = createClient();
  const [commentsLength, setCommentsLength] = useState<number | null>(null);
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getTheme = () => {
    return localStorage.getItem("editor-theme") || "github-dark";
  };
  useEffect(() => {
    const fetchSnippet = async () => {
      setIsLoading(true);
      const { data: snippet, error } = await supabase
        .from("snippets")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.log(error);
      } else {
        setSnippet(snippet);
      }
      setIsLoading(false);
    };
    fetchSnippet();
  }, [id, supabase]);

  if (isLoading) {
    return <SnippetLoadingSkeleton />;
  }
  return (
    <div>
      <div className="min-h-screen bg-[#0a0a0f] rounded-2xl">
        <main className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="bg-[#121218] border border-[#ffffff0a] rounded-2xl p-6 sm:p-8 mb-6 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center size-12 rounded-xl bg-[#ffffff08] p-2.5">
                  <Image
                    src={`/${snippet?.language}.png`}
                    alt={`${snippet?.language} logo`}
                    className="w-full h-full object-contain"
                    width={48}
                    height={48}
                  />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-white mb-2">
                    {snippet?.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    <div className="flex items-center gap-2 text-[#8b8b8d]">
                      <User className="w-4 h-4" />
                      <span>{snippet?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#8b8b8d]">
                      <Clock className="w-4 h-4" />
                      <span>
                        {snippet?.created_at
                          ? new Date(snippet.created_at).toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[#8b8b8d]">
                      <MessageSquare className="w-4 h-4" />
                      <span>
                        {commentsLength || "0" || "comments?.length"} comments
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="inline-flex items-center px-3 py-1.5 bg-[#ffffff08] text-[#808086] rounded-lg text-sm font-medium">
                {snippet?.language}
              </div>
            </div>
          </div>

          <div className="mb-8 rounded-2xl overflow-hidden border border-[#ffffff0a] bg-[#121218]">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#ffffff0a]">
              <div className="flex items-center gap-2 text-[#808086]">
                <Code className="w-4 h-4" />
                <span className="text-sm font-medium">Source Code</span>
              </div>
              <CopyButton code={snippet?.code} />
            </div>
            <Editor
              height="600px"
              language={LANGUAGE_CONFIG[snippet?.language || ""].monacoLanguage}
              value={snippet?.code}
              theme={getTheme()}
              beforeMount={defineMonacoThemes}
              options={{
                minimap: { enabled: false },
                fontSize: 16,
                readOnly: true,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 16 },
                renderWhitespace: "selection",
                fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
                fontLigatures: true,
              }}
            />
          </div>

          <Comments
            snippetId={snippet?.id}
            setCommentsLength={setCommentsLength}
          />
        </main>
      </div>
    </div>
  );
};

export default SnippetPage;
