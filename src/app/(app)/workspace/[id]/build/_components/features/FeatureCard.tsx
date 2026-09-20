"use client";

import { useState } from "react";
import { Sparkles, Trash2, ChevronDown, ChevronUp, Copy, Check, Loader2 } from "lucide-react";
import type { Feature } from "./FeatureBoard";

const CATEGORY_STYLES: Record<string, string> = {
  "core":         "bg-[#2dd4bf]/10 text-[#2dd4bf] border-[#2dd4bf]/20",
  "nice-to-have": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "future":       "bg-zinc-700/50 text-zinc-400 border-zinc-600/30",
};

const CATEGORY_LABELS: Record<string, string> = {
  "core": "Core", "nice-to-have": "Nice-to-have", "future": "Future",
};

interface Props {
  feature: Feature;
  workspaceId: string;
  onPatch: (patch: Partial<Feature>) => Promise<void>;
  onDelete: () => Promise<void>;
}

export function FeatureCard({ feature, workspaceId, onPatch, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [copied, setCopied] = useState(false);
  const [localPrompt, setLocalPrompt] = useState(feature.buildPrompt);
  const [deleting, setDeleting] = useState(false);

  const generatePrompt = async () => {
    setGeneratingPrompt(true);
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/build/features/${feature.id}/prompt`,
        { method: "POST" },
      );
      const data = await res.json() as { buildPrompt?: string };
      if (data.buildPrompt) {
        setLocalPrompt(data.buildPrompt);
        setExpanded(true);
      }
    } finally {
      setGeneratingPrompt(false);
    }
  };

  const copyPrompt = async () => {
    if (!localPrompt) return;
    await navigator.clipboard.writeText(localPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete();
  };

  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData("featureId", feature.id)}
      className="group cursor-grab rounded-xl border border-white/[0.06] bg-zinc-900 p-3.5 active:cursor-grabbing"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white leading-snug">{feature.title}</p>
          {feature.sourceGap && (
            <p className="mt-0.5 text-[10px] text-[#2dd4bf]/60 leading-tight">
              from research
            </p>
          )}
        </div>
        <button
          onClick={() => { setDeleting(true); onDelete(); }}
          disabled={deleting}
          className="shrink-0 rounded p-0.5 text-zinc-700 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Category badge */}
      <div className="mt-2 flex items-center gap-2">
        <span className={[
          "rounded-full border px-2 py-0.5 text-[10px] font-medium",
          CATEGORY_STYLES[feature.category] ?? CATEGORY_STYLES.future,
        ].join(" ")}>
          {CATEGORY_LABELS[feature.category] ?? feature.category}
        </span>
        {feature.sourceGap && (
          <span className="rounded-full border border-[#2dd4bf]/15 bg-[#2dd4bf]/[0.04] px-2 py-0.5 text-[10px] text-[#2dd4bf]/70">
            research
          </span>
        )}
      </div>

      {/* Description (if any) */}
      {feature.description && (
        <p className="mt-2 text-xs leading-relaxed text-zinc-500 line-clamp-2">
          {feature.description}
        </p>
      )}

      {/* Tier assignments */}
      {feature.tierFeatures && feature.tierFeatures.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {feature.tierFeatures.map((tf) => (
            <span
              key={tf.tier.id}
              className="rounded-full border border-amber-500/20 bg-amber-500/[0.06] px-1.5 py-0.5 text-[10px] text-amber-400/80"
            >
              {tf.tier.name}
            </span>
          ))}
        </div>
      )}

      {/* Build prompt section */}
      <div className="mt-3 border-t border-white/[0.05] pt-2.5">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={generatePrompt}
            disabled={generatingPrompt}
            className="flex items-center gap-1.5 text-[10px] text-zinc-600 transition-colors hover:text-[#2dd4bf]"
          >
            {generatingPrompt ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            {localPrompt ? "Regenerate prompt" : "Generate build prompt"}
          </button>

          {localPrompt && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setExpanded((v) => !v)}
                className="text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              <button onClick={copyPrompt} className="text-zinc-600 hover:text-[#2dd4bf] transition-colors">
                {copied ? <Check className="h-3.5 w-3.5 text-[#2dd4bf]" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          )}
        </div>

        {expanded && localPrompt && (
          <div className="mt-2 rounded-lg bg-zinc-800/60 p-3 text-xs leading-relaxed text-zinc-400 border border-white/[0.05]">
            {localPrompt}
          </div>
        )}
      </div>
    </div>
  );
}
