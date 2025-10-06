import React from "react";
import Header from "@/app/_components/Header";
import SnippetClient from "./__components/SnippetClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SnippetsPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-full p-4 mx-auto">
        <Header isSnippet={true} />
        <SnippetClient />
      </div>
    </div>
  );
}
