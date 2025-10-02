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
      const { language, getCode } = get();
      const code = getCode();

      if (!code) {
        set({ error: "No code to run." });
        return;
      }

      set({ isRunning: true, error: null, output: "" });

      try {
        const runtime = LANGUAGE_CONFIG[language].pistonRuntime;

        //api call
        const response = await fetch("https://emkc.org/api/v2/piston/execute", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            language: runtime.language,
            version: runtime.version,
            files: [{ content: code }],
          }),
        });

        const data = await response.json();

        console.log("data from api :", data);

        //general error
        if (data.message) {
          set({
            error: data.message,
            executionResult: { code, output: "", error: data.message },
          });
          return;
        }

        //compile lang err
        if (data.compile && data.compile.code !== 0) {
          const errText = (
            data.compile.stderr ||
            data.compile.output ||
            "Compilation error"
          ).trim();
          set({
            error: errText,
            executionResult: { code, output: "", error: errText },
          });
          return;
        }

        //interpret lang err
        if (data.run && data.run.code !== 0) {
          const errText = (
            data.run.stderr ||
            data.run.output ||
            "Runtime error"
          ).trim();
          set({
            error: errText,
            executionResult: { code, output: "", error: errText },
          });
          return;
        }

        const output = data.run.output;

        set({
          output: output.trim(),
          error: null,
          executionResult: {
            code,
            output: output.trim(),
            error: null,
          },
        });
      } catch (error) {
        console.log("Error in running code :", error);
        set({
          error: "Error in running code",
          executionResult: { code, output: "", error: "Error in running code" },
        });
      } finally {
        set({ isRunning: false });
      }
    },
  };
});

export const getExecutionResult = () =>
  useCodeEditorStore.getState().executionResult;
