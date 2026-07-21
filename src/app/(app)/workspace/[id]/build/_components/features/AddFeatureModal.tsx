"use client";

import { useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { Feature } from "./FeatureBoard";

const EASE = [0.22, 1, 0.36, 1] as const;

interface Props {
  workspaceId: string;
  buildPlanId: string;
  onAdd: (feature: Feature) => void;
  onClose: () => void;
}

export function AddFeatureModal({ workspaceId, buildPlanId, onAdd, onClose }: Props) {
  const reduced = useReducedMotion();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("core");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/build/features`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buildPlanId, title: title.trim(), description: description.trim() || null, category, columnId: "ideas" }),
      });
      const data = await res.json() as { feature: Feature };
      onAdd(data.feature);
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
          <h2 className="text-sm font-semibold text-white">Add feature</h2>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">Title</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Offline mode"
              className="w-full rounded-lg border border-white/[0.08] bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-[#2dd4bf]/40 focus:outline-none focus:ring-1 focus:ring-[#2dd4bf]/20 transition-colors"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this feature do?"
              rows={2}
              className="w-full resize-none rounded-lg border border-white/[0.08] bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-[#2dd4bf]/40 focus:outline-none focus:ring-1 focus:ring-[#2dd4bf]/20 transition-colors"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">Category</label>
            <div className="flex gap-2">
              {[
                { value: "core", label: "Core" },
                { value: "nice-to-have", label: "Nice-to-have" },
                { value: "future", label: "Future" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCategory(opt.value)}
                  className={[
                    "flex-1 rounded-lg border py-2 text-xs font-medium transition-all",
                    category === opt.value
                      ? "border-[#2dd4bf]/30 bg-[#2dd4bf]/[0.08] text-[#2dd4bf]"
                      : "border-white/[0.06] bg-zinc-800 text-zinc-500 hover:text-zinc-300",
                  ].join(" ")}
                >
                  {opt.label}
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
            Add feature
          </button>
        </form>
      </motion.div>
    </div>
  );
}
