import { CodeEditorState } from "@/types";
import { LANGUAGE_CONFIG } from "@/app/_constants";
import type * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { create } from "zustand";

const getInitialState = () => {
  //process on server side
  if (typeof window === "undefined") {
    return {
      language: "javascript",
      fontSize: 16,
      theme: "github-dark",
    };
  }

  //process on browser
  const savedLanguage = localStorage.getItem("editor-language") || "javascript";
  const savedFontSize = localStorage.getItem("editor-font-size") || 16;
  const savedTheme = localStorage.getItem("editor-theme") || "github-dark";
  return {
    language: savedLanguage,
    fontSize: Number(savedFontSize),
    theme: savedTheme,
  };
};

export const useCodeEditorStore = create<CodeEditorState>((set, get) => {
  const initialState = getInitialState();

  return {
    ...initialState,
    output: "",
    isRunning: false,
    error: null,
    editor: null,
    executionResult: null,
    getCode: () => get().editor?.getValue() || "",
    setEditor: (editor: monaco.editor.IStandaloneCodeEditor) => {
      const savedCode = localStorage.getItem(`editor-code-${get().language}`);

      if (savedCode) editor.setValue(savedCode);
      set({ editor });
    },
    setTheme: (theme: string) => {
      localStorage.setItem("editor-theme", theme);
      set({ theme });
    },

    setFontSize: (fontSize: number) => {
      localStorage.setItem("editor-font-size", fontSize.toString());
      set({ fontSize });
    },
    setLanguage: (language: string) => {
      const currentCode = get().editor?.getValue();
      if (currentCode) {
        localStorage.setItem(`editor-code-${get().language}`, currentCode);
      }
      localStorage.setItem("editor-language", language);

      set({
        language,
        output: "",
        error: null,
      });
    },
    runCode: async () => {
      // will work it
    },
  };
});
