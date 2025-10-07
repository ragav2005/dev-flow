import { Trash2Icon, UserIcon } from "lucide-react";
import { Comment as CommentType } from "./Comments";
import CommentContent from "./CommentContent";

interface CommentProps {
  comment: CommentType;
  onDelete: (commentId: number) => void;
  isDeleting: boolean;
  currentUserId?: string;
}
const Comment = ({
  comment,
  currentUserId,
  isDeleting,
  onDelete,
}: CommentProps) => {
  return (
    <div className="group">
      <div className="bg-[#0a0a0f] rounded-xl p-6 border border-[#ffffff0a] hover:border-[#ffffff14] transition-all">
        <div className="flex items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#ffffff08] flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-4 h-4 text-[#808086]" />
            </div>
            <div className="min-w-0">
              <span className="block text-[#e1e1e3] font-medium truncate">
                {comment.name}
              </span>
              <span className="block text-sm text-[#808086]">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {comment.userId === currentUserId && (
            <button
              onClick={() => onDelete(comment.id)}
              disabled={isDeleting}
              className=" cursor-pointer p-2 hover:bg-red-500/10 rounded-lg transition-all"
              title="Delete comment"
            >
              <Trash2Icon className="w-4 h-4 text-red-400" />
            </button>
          )}
        </div>

        <CommentContent content={comment.content} />
      </div>
    </div>
  );
};
export default Comment;
