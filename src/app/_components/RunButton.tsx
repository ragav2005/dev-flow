import React from "react";
import { Play } from "lucide-react";

export default function RunButton() {
  return (
    <div className="">
      <button className="flex flex-row items-center bg-blue-500/80 py-2 px-3 rounded-xl cursor-pointer hover:bg-blue-600/80">
        <Play className="size-5 mr-3" />
        <p>Run Code</p>
      </button>
    </div>
  );
}
