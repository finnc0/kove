"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "AI writing assistants",
  "Expense tracking for freelancers",
  "Habit tracking apps",
];

interface Props {
  value: string;
  onChange: (v: string) => void;
  onContinue: () => void;
  loading?: boolean;
  error?: string;
}

export function StepNiche({ value, onChange, onContinue, loading = false, error: serverError = "" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowSuggestions(true), 400);
    return () => clearTimeout(t);
  }, []);

  function handleContinue() {
    if (!value.trim() || value.trim().length < 3) {
      setError("Please name your niche to continue");
      return;
    }
    setError("");
    onContinue();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleContinue();
  }

  return (
    <div className="space-y-0 w-full">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest text-center mb-6">
        New workspace
      </p>

      <h1 className="text-3xl font-semibold text-white text-center leading-snug">
        What market are you researching?
      </h1>

      <div className="mt-8">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setError(""); }}
          onKeyDown={handleKeyDown}
          placeholder="e.g. AI note-taking apps, B2B invoicing tools…"
          className="w-full text-xl text-white placeholder:text-zinc-700 border-0 border-b-2 border-white/10 focus:border-white focus:outline-none focus:ring-0 pb-3 bg-transparent transition-colors text-center"
        />

        {error || serverError ? (
          <p className="text-xs text-red-400 text-center mt-2">{error || serverError}</p>
        ) : (
          <p className="text-xs text-zinc-600 text-center mt-3">
            Be specific — a focused niche gives sharper findings
          </p>
        )}
      </div>

      {/* Suggestion chips */}
      <div
        className={cn(
          "flex gap-2 justify-center mt-6 flex-wrap transition-all duration-300",
          showSuggestions ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
        )}
      >
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => { onChange(s); setError(""); inputRef.current?.focus(); }}
            className="text-xs text-zinc-500 border border-white/[0.08] rounded-full px-3 py-1.5 cursor-pointer hover:border-white/20 hover:text-zinc-300 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex justify-center mt-10">
        <button
          onClick={handleContinue}
          disabled={!value.trim() || loading}
          className={cn(
            "px-8 py-2.5 text-sm font-medium rounded-lg bg-white text-zinc-900 transition-all flex items-center gap-2",
            !value.trim() || loading ? "opacity-40 cursor-not-allowed" : "hover:bg-zinc-100 cursor-pointer"
          )}
        >
          {loading && <span className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin" />}
          {loading ? "Creating…" : "Create Workspace"}
        </button>
      </div>
    </div>
  );
}
