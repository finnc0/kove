import type { ReportPageData } from "./types";

export function MethodologyTab({ data }: { data: ReportPageData }) {
  // Phase 3: estimateRefined flag, confidence, data sources,
  //          analyzedAt, disclaimer, facts-vs-estimates note
  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-600">Methodology — coming in Phase 3</p>
    </div>
  );
}
