import type { Metadata } from "next";
import { TopBar } from "@/components/app/TopBar";
import { NewAnalysisFlow } from "./_components/NewAnalysisFlow";

export const metadata: Metadata = {
  title: "New Analysis — Kove",
};

type Mode = "market" | "app" | "sweep";

export default async function NewAnalysisPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  const initialMode: Mode | null =
    mode === "market" || mode === "app" || mode === "sweep" ? mode : null;

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        crumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "New Analysis" },
        ]}
      />
      <div className="max-w-2xl mx-auto w-full px-8 py-10">
        <h1 className="text-2xl font-semibold text-white">New Analysis</h1>
        <p className="text-sm text-zinc-500 mt-1">Choose a mode and enter your research inputs</p>
        <NewAnalysisFlow initialMode={initialMode} />
      </div>
    </div>
  );
}
