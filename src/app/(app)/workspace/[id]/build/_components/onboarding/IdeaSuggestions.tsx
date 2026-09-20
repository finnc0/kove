"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Loader2, Lightbulb } from "lucide-react";
import type { IdeaSuggestion } from "@/app/api/workspaces/[id]/build/suggest-ideas/route";

const EASE = [0.22, 1, 0.36, 1] as const;

interface Props {
  workspaceId: string;
  workspaceName: string;
  onPick: (idea: string, sourceGap: string) => void;
  onBack: () => void;
}

export function IdeaSuggestions({ workspaceId, workspaceName, onPick, onBack }: Props) {
  const reduced = useReducedMotion();
  const [ideas, setIdeas] = useState<IdeaSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [noData, setNoData] = useState(false);
  const [error, setError] = useState(false);
  const [customIdea, setCustomIdea] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/workspaces/${workspaceId}/build/suggest-ideas`, { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        if (data.noData) {
          setNoData(true);
          setShowCustom(true);
        } else if (Array.isArray(data.ideas)) {
          setIdeas(data.ideas);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  const fade = (delay = 0) => ({
    initial: reduced ? {} : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay, ease: EASE },
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <Loader2 className="h-6 w-6 animate-spin text-[#2dd4bf]" />
        <p className="text-sm text-zinc-500">
          Finding gaps in {workspaceName}…
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-[#2dd4bf]" />
          <p className="text-xs font-semibold uppercase tracking-widest text-[#2dd4bf]">
            From your research
          </p>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          {noData
            ? "Add competitors first to unlock gap-derived ideas."
            : `Kove found ${ideas.length} gaps worth building into.`}
        </h1>
        {!noData && (
          <p className="mt-1.5 text-sm text-zinc-500">
            Each idea is grounded in a real unmet need from {workspaceName}.
          </p>
        )}
      </div>

      {(error || noData) ? null : (
        <div className="flex flex-col gap-3">
          {ideas.map((idea, i) => (
            <motion.button
              key={i}
              {...fade(i * 0.07)}
              onClick={() => onPick(idea.concept, idea.solvesGap)}
              className="group flex flex-col gap-2 rounded-xl border border-white/[0.06] bg-zinc-900 p-4 text-left transition-all hover:border-[#2dd4bf]/30 hover:bg-[#2dd4bf]/[0.03]"
            >
              <p className="text-sm font-semibold text-white group-hover:text-[#2dd4bf] transition-colors">
                {idea.concept}
              </p>
              <p className="text-xs leading-relaxed text-zinc-500">
                <span className="font-medium text-[#2dd4bf]/70">solves: </span>
                {idea.solvesGap}
              </p>
              <p className="text-xs text-zinc-600">{idea.why}</p>
              <div className="mt-1 flex items-center gap-1 text-xs text-zinc-600 group-hover:text-[#2dd4bf]/60 transition-colors">
                Build this <ArrowRight className="h-3 w-3" />
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Custom input — always available after suggestions */}
      {!loading && (
        <div className="flex flex-col gap-3">
          {!showCustom && (
            <button
              onClick={() => setShowCustom(true)}
              className="text-left text-xs text-zinc-600 transition-colors hover:text-zinc-400"
            >
              Or type your own idea →
            </button>
          )}
          {showCustom && (
            <motion.div {...fade(0)} className="flex flex-col gap-3">
              <textarea
                autoFocus
                value={customIdea}
                onChange={(e) => setCustomIdea(e.target.value)}
                placeholder="Describe your idea in 1–2 sentences…"
                rows={2}
                className="w-full resize-none rounded-xl border border-white/[0.08] bg-zinc-900 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-[#2dd4bf]/40 focus:outline-none focus:ring-1 focus:ring-[#2dd4bf]/20 transition-colors"
              />
              <button
                onClick={() => {
                  if (customIdea.trim()) onPick(customIdea.trim(), "");
                }}
                disabled={!customIdea.trim()}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#2dd4bf] px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-[#5eead4] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Use this idea
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </div>
      )}

      <button
        onClick={onBack}
        className="text-left text-xs text-zinc-700 transition-colors hover:text-zinc-500"
      >
        ← Back
      </button>
    </div>
  );
}
