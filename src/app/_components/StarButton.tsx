import React from "react";
import { Star } from "lucide-react";

type StarButtonProps = {
  snippetId: number;
  isStarred: boolean;
  starCount: number;
  onToggle: (snippetId: number) => void;
};

const StarButton = ({
  snippetId,
  isStarred,
  starCount,
  onToggle,
}: StarButtonProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle(snippetId);
  };

  return (
    <button
      onClick={handleClick}
      className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer 
        transition-all duration-200 ${
          isStarred
            ? "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
            : "bg-gray-500/10 text-gray-400 hover:bg-gray-500/20"
        }`}
      aria-pressed={isStarred}
      title={isStarred ? "Unstar snippet" : "Star snippet"}
    >
      <Star
        className={`w-4 h-4 transition-all ${
          isStarred ? "fill-yellow-500" : "fill-none"
        }`}
      />
      <span
        className={`text-xs font-medium ${
          isStarred ? "text-yellow-500" : "text-gray-400"
        }`}
      >
        {starCount}
      </span>
    </button>
  );
};

export default StarButton;
