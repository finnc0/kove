"use client";

import { useEffect, useRef } from "react";
import { Plus, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  onAddCompetitor: () => void;
  onAddIdea: () => void;
  onClose: () => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export function AddPopover({ onAddCompetitor, onAddIdea, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    // Small delay so the click that opened us doesn't immediately close us
    const id = setTimeout(() => document.addEventListener("mousedown", onMouseDown), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -6, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -4, scale: 0.97 }}
      transition={{ duration: 0.15, ease: EASE }}
      className="absolute left-full top-0 z-50 ml-2.5 w-52 overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900 shadow-2xl"
    >
      {/* Competitor app */}
      <button
        onClick={() => { onAddCompetitor(); onClose(); }}
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04]"
      >
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-zinc-800">
          <Plus className="h-3.5 w-3.5 text-zinc-400" />
        </span>
        <div>
          <p className="text-sm font-medium text-white">Competitor app</p>
          <p className="text-[11px] leading-snug text-zinc-600">App Store URL or keyword</p>
        </div>
      </button>

      <div className="mx-3 h-px bg-white/[0.05]" />

      {/* Idea node */}
      <button
        onClick={() => { onAddIdea(); onClose(); }}
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04]"
      >
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-violet-500/20">
          <Lightbulb className="h-3.5 w-3.5 text-violet-400" />
        </span>
        <div>
          <p className="text-sm font-medium text-white">Idea node</p>
          <p className="text-[11px] leading-snug text-zinc-600">Evaluate your concept</p>
        </div>
      </button>
    </motion.div>
  );
}
