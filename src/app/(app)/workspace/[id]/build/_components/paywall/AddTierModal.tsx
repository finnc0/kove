"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X, Plus, Loader2 } from "lucide-react";
import type { PSTier } from "./types";

const EASE = [0.22, 1, 0.36, 1] as const;

const PRESETS = ["Free", "Pro", "Growth", "Enterprise", "Lifetime"];

interface Props {
  workspaceId: string;
  onAdd: (tier: PSTier) => void;
  onClose: () => void;
}

export function AddTierModal({ workspaceId, onAdd, onClose }: Props) {
  const reduced = useReducedMotion();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (tierName: string) => {
    if (!tierName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/build/tiers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tierName.trim() }),
      });
      const data = await res.json() as { tier: { id: string; name: string; order: number; prices: Record<string, string> | null; notes: string | null; tierFeatures: { featureId: string }[] } };
      onAdd({
        id: data.tier.id,
        name: data.tier.name,
        order: data.tier.order,
        prices: data.tier.prices,
        notes: data.tier.notes,
        featureIds: data.tier.tierFeatures.map((tf) => tf.featureId),
      });
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
        className="w-full max-w-sm rounded-xl border border-white/[0.08] bg-zinc-900 p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Add tier</h2>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Presets */}
        <div className="mb-4">
          <p className="mb-2 text-xs text-zinc-600">Quick add</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => void submit(p)}
                disabled={saving}
                className="rounded-lg border border-white/[0.06] bg-zinc-800 px-2.5 py-1 text-xs text-zinc-400 transition-colors hover:border-white/[0.16] hover:text-white disabled:opacity-40"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2 text-xs text-zinc-700">
          <div className="flex-1 h-px bg-white/[0.04]" />
          or
          <div className="flex-1 h-px bg-white/[0.04]" />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); void submit(name); }} className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Custom tier name"
            className="flex-1 rounded-lg border border-white/[0.08] bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-[#2dd4bf]/30 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!name.trim() || saving}
            className="flex items-center gap-1.5 rounded-lg bg-[#2dd4bf] px-3 py-2 text-xs font-semibold text-zinc-950 transition-colors hover:bg-[#5eead4] disabled:opacity-40"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
