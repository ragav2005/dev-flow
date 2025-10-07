import { createClient } from "@/utils/supabase/client";
import React, { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { ToastViewport, ToastData } from "@/app/_components/Toast";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import Comment from "./Comment";
import CommentForm from "./CommentForm";

export interface Comment {
  id: number;
  snippetId: number;
  userId: string;
  name: string;
  content: string;
  created_at: string;
}

const Comments = ({
  snippetId,
  setCommentsLength,
}: {
  snippetId: number | undefined;
  setCommentsLength: (number: number) => void;
}) => {
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null
  );
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

  const deleteComment = async (commentId: number) => {
    if (!user) {
      pushToast({
        message: "You must be signed in to delete comments.",
        variant: "error",
      });
      return;
    }

    setDeletingCommentId(commentId);

    try {
      const { error } = await supabase
        .from("snippetComments")
        .delete()
        .eq("id", commentId)
        .eq("userId", user.id);

      if (error) {
        console.error("Error deleting comment:", error);
        pushToast({
          message: "Failed to delete comment.",
          variant: "error",
        });
      } else {
        setComments((prev) =>
          prev.filter((comment) => comment.id !== commentId)
        );
        pushToast({
          message: "Comment deleted successfully.",
          variant: "success",
        });
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      pushToast({
        message: "An unexpected error occurred.",
        variant: "error",
      });
    } finally {
      setDeletingCommentId(null);
    }
  };

  const submitComment = async (content: string) => {
    if (!user) {
      pushToast({
        message: "User needs to signin to post comments.",
        variant: "error",
      });
      return;
    }

    if (!content.trim()) {
      pushToast({
        message: "Comment cannot be empty.",
        variant: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        snippetId: snippetId,
        userId: user.id,
        name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Anonymous",
        content: content.trim(),
      };

      const { data, error } = await supabase
        .from("snippetComments")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("Error inserting comment:", error);
        pushToast({
          message: "Failed to post comment. Please try again.",
          variant: "error",
        });
      } else {
        setComments((prev) => [...prev, data]);
        pushToast({
          message: "Comment posted successfully!",
          variant: "success",
        });
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      pushToast({
        message: "An unexpected error occurred.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      // Fetch user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      console.log(user);

      // Fetch comments for this snippet
      if (snippetId) {
        const { data: commentsData, error } = await supabase
          .from("snippetComments")
          .select("*")
          .eq("snippetId", snippetId)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching comments:", error);
        } else {
          setComments(commentsData || []);
        }
      }
    };
    fetchData();
  }, [supabase, snippetId]);

  useEffect(() => {
    setCommentsLength(comments.length || 0);
  }, [comments, setCommentsLength]);

  return (
    <div className="bg-[#121218] border border-[#ffffff0a] rounded-2xl overflow-hidden">
      <div className="px-6 sm:px-8 py-6 border-b border-[#ffffff0a]">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Discussion ({comments.length})
        </h2>
      </div>
      <div className="p-6 sm:p-8">
        {user ? (
          <CommentForm onSubmit={submitComment} isSubmitting={isSubmitting} />
        ) : (
          <div className="bg-[#0a0a0f] rounded-xl p-6 text-center mb-8 border border-[#ffffff0a]">
            <p className="text-[#808086] mb-4">
              Sign in to join the discussion
            </p>
            <Link
              href="/signin"
              className="px-6 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors cursor-pointer"
            >
              Sign In
            </Link>
          </div>
        )}

        <div className="space-y-6">
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              onDelete={deleteComment}
              isDeleting={deletingCommentId === comment.id}
              currentUserId={user?.id}
            />
          ))}
        </div>
      </div>

      {/* toast  */}
      <div className="pointer-events-none fixed top-4 inset-x-0 z-50 flex items-center justify-center">
        <div className="pointer-events-auto max-w-md w-full px-4">
          <ToastViewport toasts={toasts} onClose={dismissToast} />
        </div>
      </div>
    </div>
  );
};

export default Comments;
