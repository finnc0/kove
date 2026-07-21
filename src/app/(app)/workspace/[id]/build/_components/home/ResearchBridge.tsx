"use client";

import { useState } from "react";
import { Plus, Check, Loader2 } from "lucide-react";
import type { SynthesisGap, SynthesisPainPoint } from "@/lib/analysis/workspaceSynthesis";

interface Props {
  workspaceId: string;
  buildPlanId: string;
  gaps: SynthesisGap[];
  painPoints: SynthesisPainPoint[];
}

function BridgeItem({
  title,
  description,
  sourceGap,
  buildPlanId,
  workspaceId,
}: {
  title: string;
  description: string;
  sourceGap: string;
  buildPlanId: string;
  workspaceId: string;
}) {
  const [state, setState] = useState<"idle" | "adding" | "done">("idle");

  const add = async () => {
    setState("adding");
    try {
      await fetch(`/api/workspaces/${workspaceId}/build/features`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buildPlanId,
          title,
          description,
          sourceGap,
          category: "core",
        }),
      });
      setState("done");
    } catch {
      setState("idle");
    }
  };

  return (
    <div className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0 border-b border-white/[0.04] last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white truncate">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-zinc-500 line-clamp-2">{description}</p>
      </div>
      <button
        onClick={add}
        disabled={state !== "idle"}
        className={[
          "shrink-0 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
          state === "done"
            ? "border-[#2dd4bf]/30 bg-[#2dd4bf]/[0.08] text-[#2dd4bf]"
            : state === "adding"
              ? "border-white/[0.06] bg-zinc-800 text-zinc-600"
              : "border-white/[0.06] bg-zinc-800 text-zinc-400 hover:border-white/[0.16] hover:text-white",
        ].join(" ")}
      >
        {state === "adding" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : state === "done" ? (
          <>
            <Check className="h-3.5 w-3.5" />
            Added
          </>
        ) : (
          <>
            <Plus className="h-3.5 w-3.5" />
            Add as feature
          </>
        )}
      </button>
    </div>
  );
}

export function ResearchBridge({ workspaceId, buildPlanId, gaps, painPoints }: Props) {
  const items = [
    ...gaps.map((g) => ({ title: g.title, description: g.opportunity, sourceGap: g.title })),
    ...painPoints.slice(0, 3).map((p) => ({
      title: p.title,
      description: p.description,
      sourceGap: p.title,
    })),
  ];

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-1">Research</p>
        <p className="text-sm text-zinc-600">
          No findings yet — add 3+ competitors to your workspace to surface gaps and pain points.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#2dd4bf]/70 mb-0.5">
            From research
          </p>
          <h3 className="text-sm font-semibold text-white">Market gaps & pain points</h3>
        </div>
        <span className="rounded-full border border-[#2dd4bf]/20 bg-[#2dd4bf]/[0.06] px-2 py-0.5 text-[10px] font-medium text-[#2dd4bf]">
          {items.length} signals
        </span>
      </div>
      <div>
        {items.map((item, i) => (
          <BridgeItem
            key={i}
            title={item.title}
            description={item.description}
            sourceGap={item.sourceGap}
            buildPlanId={buildPlanId}
            workspaceId={workspaceId}
          />
        ))}
      </div>
    </div>
  );
}
