export const dynamic = "force-dynamic";
export const revalidate = 0;
import Header from "../_components/Header";
import EditorPanel from "../_components/EditorPanel";
import OutputPanel from "../_components/OutputPanel";

export default async function Home() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1800px] p-4 mx-auto ">
        <Header />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <EditorPanel />
          <OutputPanel />
        </div>
      </div>
    </div>
  );
}
