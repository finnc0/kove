"use client";

import type { IdeaEvaluation } from "@/app/api/workspaces/[id]/idea/evaluate/route";

interface Props {
  verdict: "strong" | "partial" | "crowded";
  evaluation: IdeaEvaluation;
  isStale: boolean;
  onReEvaluate: () => void;
  onOpenBreakdown: () => void;
  onEdit: () => void;
  analyzing: boolean;
}

const VERDICT_LABEL = {
  strong: "Strong signal",
  partial: "Partial fit",
  crowded: "Crowded space",
} as const;

const VERDICT_DOT = {
  strong: "#2dd4bf",
  partial: "#f59e0b",
  crowded: "#52525b",
} as const;

export function IdeaVerdict({
  verdict,
  evaluation,
  isStale,
  onReEvaluate,
  onOpenBreakdown,
  onEdit,
  analyzing,
}: Props) {
  const matchedCount = evaluation.gaps_filled.filter((g) => g.matched).length;
  const totalGaps = evaluation.gaps_filled.length;
  const topOverlap = evaluation.overlaps[0] ?? null;

  return (
    <div className="mt-3">
      {/* Summary */}
      <p className="line-clamp-2 text-xs leading-relaxed text-zinc-400">
        {evaluation.summary}
      </p>

      {/* Gaps indicator — same dot pattern as competitor pain row */}
      {totalGaps > 0 && (
        <div className="mt-2.5 flex items-center gap-2">
          <div className="flex shrink-0 items-center gap-0.5">
            {Array.from({ length: totalGaps > 3 ? 3 : totalGaps }).map((_, i) => (
              <span
                key={i}
                className="block h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor:
                    i < matchedCount ? "#2dd4bf" : "rgba(255,255,255,0.07)",
                }}
              />
            ))}
          </div>
          <p className="truncate text-[10px] text-zinc-500">
            {matchedCount} of {totalGaps} gap{totalGaps !== 1 ? "s" : ""} addressed
          </p>
        </div>
      )}

      {/* Top overlap warning */}
      {topOverlap && (
        <p className="mt-1 text-[10px] text-zinc-600">
          ⚠ overlaps {topOverlap.competitor}
          {evaluation.overlaps.length > 1 ? ` +${evaluation.overlaps.length - 1}` : ""}
        </p>
      )}

      {/* Stale nudge */}
      {isStale && !analyzing && (
        <div className="mt-2.5 flex items-center gap-2 border-t border-white/[0.04] pt-2.5">
          <p className="text-[10px] text-zinc-600">New competitors —</p>
          <button
            onClick={(e) => { e.stopPropagation(); onReEvaluate(); }}
            onMouseDown={(e) => e.stopPropagation()}
            className="nodrag nopan text-[10px] text-zinc-500 transition-colors hover:text-[#2dd4bf]"
          >
            re-evaluate →
          </button>
        </div>
      )}

      <div className="mt-3 h-px bg-white/[0.05]" />

      {/* Footer: edit + see breakdown */}
      <div className="mt-2.5 flex items-center justify-between">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          onMouseDown={(e) => e.stopPropagation()}
          className="nodrag nopan text-[10px] text-zinc-700 transition-colors hover:text-zinc-400"
        >
          Edit idea
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onOpenBreakdown(); }}
          onMouseDown={(e) => e.stopPropagation()}
          className="nodrag nopan text-[10px] text-zinc-600 transition-colors hover:text-zinc-300"
        >
          See breakdown →
        </button>
      </div>
    </div>
  );
}

export { VERDICT_LABEL, VERDICT_DOT };
