import { ConfidenceChip } from "./ConfidenceChip";

export function MethodologyCard({
  confidence,
  confidenceLabel,
  isPreliminary,
  disclaimer,
}: {
  confidence: string;
  confidenceLabel: string;
  isPreliminary: boolean;
  disclaimer: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.04] bg-zinc-900/40 p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold text-zinc-600">Methodology</h3>
        <ConfidenceChip level={confidence} />
      </div>

      <div className="space-y-2.5 text-xs text-zinc-600">
        <p>
          <span className="font-medium text-zinc-500">Estimate type: </span>
          {isPreliminary
            ? "Preliminary — based on rating velocity and market benchmarks. Accuracy improves after 48h."
            : `Refined — ${confidenceLabel.toLowerCase()}. Updated with new rating data.`}
        </p>

        <p>
          <span className="font-medium text-zinc-500">Data sources: </span>
          App Store metadata, review sample, chart positions, in-app purchase
          catalog, developer pricing page.
        </p>

        {disclaimer && (
          <p className="italic text-zinc-700">{disclaimer}</p>
        )}
      </div>
    </div>
  );
}
