"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X, Plus, Loader2 } from "lucide-react";
import { SCREEN_TYPES, TYPE_STYLES } from "./types";

const EASE = [0.22, 1, 0.36, 1] as const;

interface Props {
  workspaceId: string;
  onAdd: (screen: { id: string; title: string; type: string; order: number; purpose: string | null; wireframeJson: unknown; aiPrompt: string | null; paywallTierId: string | null; notes: string | null; buildPlanId: string }) => void;
  onClose: () => void;
}

export function OFAddScreenModal({ workspaceId, onAdd, onClose }: Props) {
  const reduced = useReducedMotion();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("custom");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/build/screens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), type }),
      });
      const data = await res.json() as { screen: { id: string; title: string; type: string; order: number; purpose: string | null; wireframeJson: unknown; aiPrompt: string | null; paywallTierId: string | null; notes: string | null; buildPlanId: string } };
      onAdd(data.screen);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <motion.div
        initial={reduced ? {} : { opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: EASE }}
        className="w-full max-w-md rounded-xl border border-white/[0.08] bg-zinc-900 p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Add screen</h2>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">Screen name</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Welcome screen"
              className="w-full rounded-lg border border-white/[0.08] bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-[#2dd4bf]/40 focus:outline-none focus:ring-1 focus:ring-[#2dd4bf]/20 transition-colors"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-500">Type</label>
            <div className="flex flex-wrap gap-1.5">
              {SCREEN_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={[
                    "rounded-full border px-2.5 py-1 text-xs font-medium transition-all",
                    type === t.value
                      ? (TYPE_STYLES[t.value] ?? "bg-zinc-700 text-zinc-300 border-zinc-600")
                      : "border-white/[0.06] bg-zinc-800/60 text-zinc-500 hover:text-zinc-300",
                  ].join(" ")}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!title.trim() || saving}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#2dd4bf] py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-[#5eead4] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add screen
          </button>
        </form>
      </motion.div>
    </div>
  );
}
