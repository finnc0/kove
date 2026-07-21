"use client";

import { useState } from "react";
import { Sparkles, Loader2, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  workspaceId: string;
  screenId: string;
  existingPrompt: string | null;
  onGenerated: (prompt: string) => void;
}

export function OFScreenPromptButton({ workspaceId, screenId, existingPrompt, onGenerated }: Props) {
  const [loading, setLoading] = useState(false);
  const [localPrompt, setLocalPrompt] = useState(existingPrompt);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/build/screens/${screenId}/prompt`,
        { method: "POST" },
      );
      const data = await res.json() as { aiPrompt?: string };
      if (data.aiPrompt) {
        setLocalPrompt(data.aiPrompt);
        onGenerated(data.aiPrompt);
        setExpanded(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!localPrompt) return;
    await navigator.clipboard.writeText(localPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <button
          onClick={generate}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-[#2dd4bf]"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {localPrompt ? "Regenerate build prompt" : "Generate build prompt"}
        </button>
        {localPrompt && (
          <div className="flex items-center gap-1">
            <button onClick={() => setExpanded((v) => !v)} className="text-zinc-600 hover:text-zinc-400 transition-colors">
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            <button onClick={copy} className="text-zinc-600 hover:text-[#2dd4bf] transition-colors">
              {copied ? <Check className="h-3.5 w-3.5 text-[#2dd4bf]" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        )}
      </div>
      {expanded && localPrompt && (
        <div className="mt-2 rounded-lg border border-white/[0.05] bg-zinc-800/60 p-3 text-xs leading-relaxed text-zinc-400">
          {localPrompt}
        </div>
      )}
    </div>
  );
}
