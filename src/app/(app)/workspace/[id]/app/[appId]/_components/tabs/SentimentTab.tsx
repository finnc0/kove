import type { ReportPageData } from "./types";

export function SentimentTab({ data }: { data: ReportPageData }) {
  // Phase 3: positive/negative split bar, communitySummary,
  //          positiveSignals[] themes, aiSynthesis (doesWell, fails, implication)
  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-600">Sentiment — coming in Phase 3</p>
    </div>
  );
}
