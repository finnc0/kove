"use client";

import { useCallback, useRef, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Sparkles, Trash2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEvaluateIdea } from "../../_hooks/useEvaluateIdea";
import { IdeaInput } from "./IdeaInput";
import { IdeaVerdict, VERDICT_LABEL, VERDICT_DOT } from "./IdeaVerdict";
import { useBilling } from "@/hooks/useBilling";
import { PaywallModal } from "@/components/paywall/PaywallModal";
import { UpgradeChip } from "@/components/paywall/UpgradeChip";
import type { IdeaEvaluation } from "@/app/api/workspaces/[id]/idea/evaluate/route";

export interface IdeaNodeData extends Record<string, unknown> {
  workspaceId: string;
  ideaId: string;
  text: string;
  targetUser: string | null;
  keyFeature: string | null;
  verdict: "strong" | "partial" | "crowded" | null;
  evaluation: IdeaEvaluation | null;
  lastEvaluatedAt: string | null;
  competitorCount: number;
  latestCompetitorAt: string | null;
  animateIn?: boolean;
  onEvaluated: (ev: IdeaEvaluation) => void;
  onSave: (f: { text?: string; targetUser?: string; keyFeature?: string }) => Promise<void>;
  onOpenBreakdown: () => void;
  onDelete: () => void;
}

const HANDLE_STYLE: React.CSSProperties = {
  background: "transparent",
  border: "none",
  width: 6,
  height: 6,
  minWidth: 6,
  minHeight: 6,
};

function truncateWords(str: string, max: number): string {
  const words = str.trim().split(/\s+/);
  return words.length <= max ? str : words.slice(0, max).join(" ") + "…";
}

export function IdeaNode({ data, selected }: NodeProps) {
  const d = data as unknown as IdeaNodeData;
  const prefersReducedMotion = useReducedMotion();

  const [text, setText] = useState(d.text);
  const [targetUser, setTargetUser] = useState(d.targetUser ?? "");
  const [keyFeature, setKeyFeature] = useState(d.keyFeature ?? "");
  const [mode, setMode] = useState<"editing" | "viewing">(d.verdict ? "viewing" : "editing");
  const [analyzing, setAnalyzing] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);

  const { evaluate } = useEvaluateIdea({ workspaceId: d.workspaceId });

  const isStale =
    !!d.verdict &&
    !!d.lastEvaluatedAt &&
    !!d.latestCompetitorAt &&
    new Date(d.latestCompetitorAt) > new Date(d.lastEvaluatedAt);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debouncedSave = useCallback(
    (fields: { text?: string; targetUser?: string; keyFeature?: string }) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        d.onSave(fields).catch(() => {});
      }, 600);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [d.onSave],
  );

  function handleChange(fields: { text?: string; targetUser?: string; keyFeature?: string }) {
    const next = { text, targetUser, keyFeature, ...fields };
    if (fields.text !== undefined) setText(fields.text);
    if (fields.targetUser !== undefined) setTargetUser(fields.targetUser);
    if (fields.keyFeature !== undefined) setKeyFeature(fields.keyFeature);
    debouncedSave(next);
  }

  async function handleEvaluate() {
    if (!text.trim()) return;
    setAnalyzing(true);
    setEvalError(null);
    if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null; }
    try { await d.onSave({ text, targetUser, keyFeature }); } catch {}
    const result = await evaluate();
    if (result) {
      setMode("viewing");
      d.onEvaluated(result);
    } else {
      setEvalError("Evaluation failed — try again");
    }
    setAnalyzing(false);
  }

  const billing = useBilling();
  const [paywallOpen, setPaywallOpen] = useState(false);

  const isLocked = d.competitorCount < 3;
  const isBillingLocked = !billing.loading && !billing.isPro;

  // Status dot color
  const dotColor = analyzing
    ? "#f59e0b"
    : d.verdict
      ? VERDICT_DOT[d.verdict]
      : "rgba(255,255,255,0.12)";

  const dotPulse = analyzing;

  return (
    <>
      <Handle type="source" position={Position.Top} style={HANDLE_STYLE} />
      <Handle type="source" position={Position.Right} id="right" style={HANDLE_STYLE} />
      <Handle type="target" position={Position.Bottom} style={HANDLE_STYLE} />
      <Handle type="target" position={Position.Left} id="left" style={HANDLE_STYLE} />

      <motion.div
        initial={d.animateIn && !prefersReducedMotion ? { opacity: 0 } : { opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={[
          "group w-72 rounded-2xl border bg-zinc-900 px-4 py-4 shadow-xl shadow-black/40",
          "transition-colors duration-150",
          selected
            ? "border-[#2dd4bf]/40 shadow-[0_0_0_1px_rgba(45,212,191,0.2)]"
            : "border-white/[0.07] hover:border-white/[0.15]",
        ].join(" ")}
      >
        {/* Header — mirrors CompetitorNode exactly */}
        <div className="mb-3 flex items-start gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-zinc-800">
            <Sparkles className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="truncate text-sm font-semibold leading-tight text-white">
              {text ? truncateWords(text, 5) : "Your idea"}
            </p>
            <p className="truncate text-xs text-zinc-500">
              {analyzing
                ? "evaluating…"
                : d.verdict
                  ? VERDICT_LABEL[d.verdict]
                  : targetUser
                    ? `For ${targetUser}`
                    : "Not evaluated"}
            </p>
          </div>
          <div className="mt-0.5 flex shrink-0 items-center gap-1">
            <button
              className="nodrag nopan flex h-5 w-5 items-center justify-center rounded text-zinc-700 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
              onClick={(e) => { e.stopPropagation(); d.onDelete(); }}
              title="Delete idea"
            >
              <Trash2 className="h-3 w-3" />
            </button>
            <span
              className={`block h-2 w-2 rounded-full ${dotPulse ? "animate-pulse" : ""}`}
              style={{ backgroundColor: dotColor }}
            />
          </div>
        </div>

        <div className="h-px bg-white/[0.05]" />

        {/* LOCKED — not enough competitors */}
        {isLocked && (
          <p className="mt-3 text-[10px] text-zinc-700">
            Add {3 - d.competitorCount} more competitor{3 - d.competitorCount !== 1 ? "s" : ""} to evaluate
          </p>
        )}

        {/* BILLING LOCKED — needs Pro */}
        {!isLocked && isBillingLocked && (
          <div className="mt-3">
            <button
              onClick={() => setPaywallOpen(true)}
              className="nodrag nopan flex w-full items-center justify-between rounded-lg border border-dashed border-white/[0.08] px-3 py-2 text-left transition-colors hover:border-[#2dd4bf]/30"
            >
              <span className="text-xs text-zinc-600">Evaluate against market</span>
              <UpgradeChip />
            </button>
          </div>
        )}

        {/* ANALYZING skeleton */}
        {!isLocked && !isBillingLocked && analyzing && (
          <div className="mt-3 space-y-1.5">
            <div className="h-2.5 w-full animate-pulse rounded-full bg-white/[0.05]" />
            <div className="h-2.5 w-4/5 animate-pulse rounded-full bg-white/[0.04]" />
            <div className="h-2.5 w-3/5 animate-pulse rounded-full bg-white/[0.03]" />
          </div>
        )}

        {/* EDITING form */}
        {!isLocked && !isBillingLocked && !analyzing && mode === "editing" && (
          <IdeaInput
            text={text}
            targetUser={targetUser}
            keyFeature={keyFeature}
            onChange={handleChange}
            onEvaluate={handleEvaluate}
            analyzing={analyzing}
            competitorCount={d.competitorCount}
            error={evalError}
          />
        )}

        {/* EVALUATED / STALE */}
        {!isLocked && !isBillingLocked && !analyzing && mode === "viewing" && d.verdict && d.evaluation && (
          <IdeaVerdict
            verdict={d.verdict}
            evaluation={d.evaluation}
            isStale={isStale}
            onReEvaluate={handleEvaluate}
            onOpenBreakdown={d.onOpenBreakdown}
            onEdit={() => setMode("editing")}
            analyzing={analyzing}
          />
        )}
      </motion.div>

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        gate="idea_evaluation"
        hasUsedTrial={billing.hasUsedTrial}
      />
    </>
  );
}
