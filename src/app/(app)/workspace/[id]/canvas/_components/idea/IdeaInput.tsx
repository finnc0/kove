"use client";

import { Lock } from "lucide-react";

interface Props {
  text: string;
  targetUser: string;
  keyFeature: string;
  onChange: (f: { text?: string; targetUser?: string; keyFeature?: string }) => void;
  onEvaluate: () => void;
  analyzing: boolean;
  competitorCount: number;
  error: string | null;
}

const FIELD_CLS =
  "nodrag nopan w-full rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-2 text-xs text-zinc-300 placeholder-zinc-700 outline-none transition-colors focus:border-white/[0.18]";

export function IdeaInput({
  text,
  targetUser,
  keyFeature,
  onChange,
  onEvaluate,
  analyzing,
  competitorCount,
  error,
}: Props) {
  const needed = Math.max(0, 3 - competitorCount);
  const isLocked = needed > 0;

  return (
    <div className="mt-3 space-y-2.5">
      {/* Idea description */}
      <div>
        <p className="mb-1 text-[9px] font-semibold uppercase tracking-widest text-zinc-600">
          Idea
        </p>
        <textarea
          value={text}
          onChange={(e) => onChange({ text: e.target.value })}
          onMouseDown={(e) => e.stopPropagation()}
          placeholder="What are you building?"
          rows={3}
          className={`${FIELD_CLS} resize-none leading-relaxed`}
        />
      </div>

      {/* Target user */}
      <div>
        <p className="mb-1 text-[9px] font-semibold uppercase tracking-widest text-zinc-600">
          Who's it for?
        </p>
        <input
          value={targetUser}
          onChange={(e) => onChange({ targetUser: e.target.value })}
          onMouseDown={(e) => e.stopPropagation()}
          placeholder="e.g. solo founders, SMB teams…"
          className={FIELD_CLS}
        />
      </div>

      {/* Key differentiator */}
      <div>
        <p className="mb-1 text-[9px] font-semibold uppercase tracking-widest text-zinc-600">
          Key edge
        </p>
        <input
          value={keyFeature}
          onChange={(e) => onChange({ keyFeature: e.target.value })}
          onMouseDown={(e) => e.stopPropagation()}
          placeholder="What makes it different?"
          className={FIELD_CLS}
        />
      </div>

      {error && <p className="text-[10px] text-red-400/70">{error}</p>}

      {/* CTA */}
      {isLocked ? (
        <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.04] bg-white/[0.02] px-2.5 py-2">
          <Lock className="h-3 w-3 shrink-0 text-zinc-700" />
          <p className="text-[10px] text-zinc-700">
            Add {needed} more competitor{needed !== 1 ? "s" : ""} to evaluate
          </p>
        </div>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!text.trim() || analyzing) return;
            onEvaluate();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          disabled={analyzing || !text.trim()}
          className="nodrag nopan w-full rounded-lg border border-[#2dd4bf]/20 bg-[#2dd4bf]/10 px-3 py-2 text-xs font-medium text-[#2dd4bf] transition-colors hover:bg-[#2dd4bf]/[0.15] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {analyzing ? "Evaluating…" : "Evaluate against market →"}
        </button>
      )}
    </div>
  );
}
