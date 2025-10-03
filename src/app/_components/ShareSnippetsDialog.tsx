import React, { useState } from "react";
import { X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { start } from "repl";

interface ShareSnippetsDialogProps {
  onClose: () => void;
  onSuccess: (data: { title: string }) => void;
  onError: (message?: string) => void;
}

const ShareSnippetsDialog = ({
  onClose,
  onSuccess,
  onError,
}: ShareSnippetsDialogProps) => {
  const supabase = createClient();
  const [title, setTitle] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const { language, getCode } = useCodeEditorStore();

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSharing(true);
    const code = getCode();
    const user = await supabase.auth.getUser();

    if (user.data.user) {
      const userId = user.data.user.id;
      const name =
        user.data.user.user_metadata.name ||
        user.data.user.user_metadata.full_name;
      const payload = {
        userId,
        title: title.trim(),
        language,
        code,
        name,
        startCount: 0,
      };
      try {
        const { error: insertError } = await supabase
          .from("snippets")
          .insert([payload]);
        if (insertError) {
          console.log("Failed to log execution", insertError.message);
          onError("Failed to save snippet");
          onClose();
          return;
        }
        onSuccess({ title: title.trim() });
        onClose();
      } catch (e) {
        console.log("Unexpected logging failure", e);
        onError("Failed to save snippet");
      } finally {
        setIsSharing(false);
      }
    } else {
      console.log("No user returned");
    }
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1e1e2e] rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Share Snippet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleShare}>
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#181825] border border-[#313244] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter snippet title"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-gray-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSharing}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
              disabled:opacity-50 cursor-pointer"
            >
              {isSharing ? "Sharing..." : "Share"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareSnippetsDialog;
