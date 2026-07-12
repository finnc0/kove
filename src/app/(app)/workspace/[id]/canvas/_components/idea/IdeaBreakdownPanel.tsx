"use client";

import { X, Sparkles, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import type { IdeaEvaluation } from "@/app/api/workspaces/[id]/idea/evaluate/route";

const EASE = [0.22, 1, 0.36, 1] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
        {title}
      </p>
      {children}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-zinc-900 p-3">
      <p className="text-sm font-semibold text-white">{value}</p>
      <p className="mt-0.5 text-[10px] text-zinc-600">{label}</p>
    </div>
  );
}

const VERDICT_LABEL = {
  strong: "Strong signal",
  partial: "Partial fit",
  crowded: "Crowded space",
} as const;

const VERDICT_DOT: Record<string, string> = {
  strong: "bg-[#2dd4bf]",
  partial: "bg-zinc-400",
  crowded: "bg-zinc-600",
};

interface Props {
  text: string;
  targetUser: string | null;
  keyFeature: string | null;
  verdict: "strong" | "partial" | "crowded";
  evaluation: IdeaEvaluation;
  onClose: () => void;
  onDelete: () => void;
}

export function IdeaBreakdownPanel({
  text,
  targetUser,
  keyFeature,
  verdict,
  evaluation,
  onClose,
  onDelete,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleDelete() {
    setDeleting(true);
    onDelete();
  }

  const matchedCount = evaluation.gaps_filled.filter((g) => g.matched).length;

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.25, ease: EASE }}
      className="absolute right-0 top-0 z-10 flex h-full w-[420px] flex-col border-l border-white/[0.06] bg-zinc-950"
    >
      {/* Header — matches NodeDetailPanel exactly */}
      <div className="sticky top-0 z-10 shrink-0 border-b border-white/[0.06] bg-zinc-950 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800">
              <Sparkles className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Your Idea</p>
              <p className="text-xs text-zinc-500">{VERDICT_LABEL[verdict]}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-700 transition-colors hover:bg-red-500/10 hover:text-red-400"
              title="Delete idea"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {confirmDelete && (
          <div className="mt-3 rounded-xl border border-red-500/15 bg-red-500/[0.06] p-3">
            <p className="mb-2.5 text-xs text-zinc-300">Delete this idea node?</p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-5" style={{ scrollbarWidth: "none" } as React.CSSProperties}>

        {/* The idea */}
        <Section title="The idea">
          <div className="rounded-xl border border-white/[0.05] bg-zinc-900 p-3">
            <p className="text-sm leading-relaxed text-zinc-300">{text || "—"}</p>
            {(targetUser || keyFeature) && (
              <div className="mt-2 space-y-0.5 border-t border-white/[0.04] pt-2">
                {targetUser && (
                  <p className="text-[10px] text-zinc-600">
                    <span className="text-zinc-700">For: </span>{targetUser}
                  </p>
                )}
                {keyFeature && (
                  <p className="text-[10px] text-zinc-600">
                    <span className="text-zinc-700">Key edge: </span>{keyFeature}
                  </p>
                )}
              </div>
            )}
          </div>
        </Section>

        {/* Verdict */}
        <Section title="Verdict">
          <div className="mb-3 grid grid-cols-2 gap-2">
            <StatCard label="Signal" value={VERDICT_LABEL[verdict]} />
            <StatCard
              label="Gaps addressed"
              value={`${matchedCount} / ${evaluation.gaps_filled.length}`}
            />
            <StatCard
              label="Pains solved"
              value={evaluation.pains_solved.length.toString()}
            />
            <StatCard
              label="Competitor overlaps"
              value={evaluation.overlaps.length.toString()}
            />
          </div>
          <div className="flex items-start gap-2.5 rounded-xl border border-white/[0.05] bg-zinc-900 p-3">
            <span className={`mt-1 block h-2 w-2 shrink-0 rounded-full ${VERDICT_DOT[verdict]}`} />
            <p className="text-sm leading-relaxed text-zinc-400">{evaluation.summary}</p>
          </div>
        </Section>

        {/* Gaps filled */}
        {evaluation.gaps_filled.length > 0 && (
          <Section title="Gaps filled">
            <div className="space-y-2">
              {evaluation.gaps_filled.map((g, i) => (
                <div key={i} className="rounded-xl border border-white/[0.05] bg-zinc-900 p-3">
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-0.5 shrink-0 text-xs font-bold ${
                        g.matched ? "text-[#2dd4bf]" : "text-zinc-700"
                      }`}
                    >
                      {g.matched ? "✓" : "✗"}
                    </span>
                    <p className="text-sm text-zinc-400">{g.gap}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Pains solved */}
        {evaluation.pains_solved.length > 0 && (
          <Section title="Pains solved">
            <div className="space-y-2">
              {evaluation.pains_solved.map((p, i) => (
                <div key={i} className="rounded-xl border border-white/[0.05] bg-zinc-900 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex shrink-0 items-center gap-0.5">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <span
                          key={j}
                          className="block h-1.5 w-1.5 rounded-full"
                          style={{
                            backgroundColor:
                              j < p.signal_strength
                                ? "rgba(228,228,231,0.8)"
                                : "rgba(255,255,255,0.07)",
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-sm font-medium text-white">{p.pain}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Competitor overlaps */}
        {evaluation.overlaps.length > 0 && (
          <Section title="Competitor overlaps">
            <div className="space-y-2">
              {evaluation.overlaps.map((o, i) => (
                <div key={i} className="rounded-xl border border-white/[0.05] bg-zinc-900 p-3">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="block h-2 w-2 shrink-0 rounded-full bg-zinc-600" />
                    <p className="text-sm font-medium text-white">{o.competitor}</p>
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-500">{o.reason}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Pricing position */}
        {evaluation.pricing_position && (
          <Section title="Pricing position">
            <p className="rounded-xl border border-white/[0.05] bg-zinc-900 p-3 text-sm leading-relaxed text-zinc-400">
              {evaluation.pricing_position}
            </p>
          </Section>
        )}

        {/* Full reasoning */}
        {evaluation.reasoning && (
          <Section title="Full reasoning">
            <p className="rounded-xl border border-white/[0.05] bg-zinc-900 p-3 text-sm leading-relaxed text-zinc-500 whitespace-pre-line">
              {evaluation.reasoning}
            </p>
          </Section>
        )}
      </div>
    </motion.div>
  );
}
