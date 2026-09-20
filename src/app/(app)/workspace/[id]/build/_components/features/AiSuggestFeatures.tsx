"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X, Loader2, Plus, Check } from "lucide-react";
import type { Feature } from "./FeatureBoard";
import type { FeatureSuggestion } from "@/app/api/workspaces/[id]/build/features/suggest/route";

const EASE = [0.22, 1, 0.36, 1] as const;

const CATEGORY_STYLES: Record<string, string> = {
  "core":         "bg-[#2dd4bf]/10 text-[#2dd4bf] border-[#2dd4bf]/20",
  "nice-to-have": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "future":       "bg-zinc-700/50 text-zinc-400 border-zinc-600/30",
};

interface Props {
  workspaceId: string;
  buildPlanId: string;
  onAdd: (features: Feature[]) => void;
  onClose: () => void;
}

export function AiSuggestFeatures({ workspaceId, buildPlanId, onAdd, onClose }: Props) {
  const reduced = useReducedMotion();
  const [suggestions, setSuggestions] = useState<FeatureSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [adding, setAdding] = useState<Set<number>>(new Set());
  const [added, setAdded] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch(`/api/workspaces/${workspaceId}/build/features/suggest`, { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.suggestions)) setSuggestions(data.suggestions);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  const addSuggestion = async (suggestion: FeatureSuggestion, index: number) => {
    setAdding((s) => new Set(s).add(index));
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/build/features`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buildPlanId,
          title: suggestion.title,
          description: suggestion.description,
          category: suggestion.category,
          sourceGap: suggestion.sourceGap || null,
          columnId: "ideas",
        }),
      });
      const data = await res.json() as { feature: Feature };
      onAdd([data.feature]);
      setAdded((s) => new Set(s).add(index));
    } finally {
      setAdding((s) => { const n = new Set(s); n.delete(index); return n; });
    }
  };

  return (
    <div className="rounded-xl border border-white/[0.08] bg-zinc-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#2dd4bf]/70 mb-0.5">AI suggestions</p>
          <h3 className="text-sm font-semibold text-white">Features grounded in your research</h3>
        </div>
        <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-8 text-zinc-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-xs">Generating suggestions…</span>
        </div>
      )}

      {error && (
        <p className="py-4 text-center text-xs text-zinc-600">Failed to generate suggestions. Try again.</p>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-2">
          {suggestions.map((s, i) => (
            <motion.div
              key={i}
              initial={reduced ? {} : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05, ease: EASE }}
              className="flex items-start justify-between gap-3 rounded-lg border border-white/[0.05] bg-zinc-800/50 p-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-white">{s.title}</p>
                  <span className={[
                    "rounded-full border px-1.5 py-0.5 text-[10px] font-medium shrink-0",
                    CATEGORY_STYLES[s.category] ?? CATEGORY_STYLES.future,
                  ].join(" ")}>
                    {s.category}
                  </span>
                </div>
                {s.sourceGap && (
                  <p className="text-[10px] text-[#2dd4bf]/60 mb-1">
                    solves: {s.sourceGap}
                  </p>
                )}
                <p className="text-xs text-zinc-500 leading-relaxed">{s.description}</p>
              </div>
              <button
                onClick={() => addSuggestion(s, i)}
                disabled={adding.has(i) || added.has(i)}
                className={[
                  "shrink-0 flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all",
                  added.has(i)
                    ? "border-[#2dd4bf]/30 bg-[#2dd4bf]/[0.08] text-[#2dd4bf]"
                    : "border-white/[0.08] bg-zinc-900 text-zinc-400 hover:border-white/[0.16] hover:text-white",
                ].join(" ")}
              >
                {adding.has(i) ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : added.has(i) ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
