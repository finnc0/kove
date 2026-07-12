"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const MAX_CHARS = 280;

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
  loading: boolean;
  error: string;
}

export function StepBrief({ value, onChange, onSubmit, onSkip, loading, error }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") onSubmit();
  }

  return (
    <div className="w-full">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest text-center mb-6">
        Optional
      </p>

      <h1 className="text-3xl font-semibold text-white text-center leading-snug">
        What are you trying to build?
      </h1>
      <p className="text-sm text-zinc-500 text-center mt-2">
        This helps Kove frame findings around your specific goal
      </p>

      <div className="mt-8">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
          onKeyDown={handleKeyDown}
          rows={3}
          placeholder="e.g. A privacy-first alternative to Notion for solo founders…"
          className="w-full text-base text-white placeholder:text-zinc-700 border-0 border-b-2 border-white/10 focus:border-white focus:outline-none focus:ring-0 pb-3 bg-transparent transition-colors resize-none"
        />
        <p className="text-xs text-zinc-700 text-right mt-2">
          {value.length} / {MAX_CHARS}
        </p>
      </div>

      <div className="mt-10 flex flex-col items-center gap-3">
        <button
          onClick={onSubmit}
          disabled={loading}
          className={cn(
            "px-8 py-2.5 text-sm font-medium rounded-lg bg-white text-zinc-900 transition-all flex items-center gap-2",
            loading ? "opacity-60 cursor-not-allowed" : "hover:bg-zinc-100 cursor-pointer"
          )}
        >
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin" />
              Creating…
            </>
          ) : (
            "Create Workspace"
          )}
        </button>

        <button
          onClick={onSkip}
          disabled={loading}
          className="text-sm text-zinc-500 hover:text-zinc-300 cursor-pointer hover:underline underline-offset-4 transition-colors disabled:opacity-40"
        >
          Skip for now
        </button>

        {error && (
          <p className="text-xs text-red-400 text-center mt-1">{error}</p>
        )}
      </div>
    </div>
  );
}
