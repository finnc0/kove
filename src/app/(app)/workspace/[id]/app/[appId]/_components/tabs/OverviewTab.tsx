import type { ReportPageData } from "./types";

export function OverviewTab({ data }: { data: ReportPageData }) {
  const { report } = data;
  if (!report) return null;
  // Phase 3: description, platforms, top-3 pain points, pricing summary, AI synthesis
  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-600">Overview — coming in Phase 3</p>
    </div>
  );
}
