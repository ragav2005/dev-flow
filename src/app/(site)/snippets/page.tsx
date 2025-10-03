import React from "react";
import Header from "@/app/_components/Header";
import SnippetsClient from "../snippets/__components/SnippetsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SnippetsPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-full p-4 mx-auto">
        <Header isSnippet={true} />
        <SnippetsClient />
      </div>
    </div>
  );
}
