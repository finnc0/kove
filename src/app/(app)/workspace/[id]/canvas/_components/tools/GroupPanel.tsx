"use client";

import { useEffect, useRef, useState } from "react";
import { X, Layers } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  selectedIds: string[];
  nodeNames: Record<string, string>;
  onConfirm: (label: string, color: string) => void;
  onCancel: () => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const COLORS = [
  { label: "Zinc",   value: "#3f3f46" },
  { label: "Teal",   value: "#0d9488" },
  { label: "Blue",   value: "#2563eb" },
  { label: "Violet", value: "#7c3aed" },
  { label: "Rose",   value: "#e11d48" },
  { label: "Amber",  value: "#d97706" },
];

export function GroupPanel({ selectedIds, nodeNames, onConfirm, onCancel }: Props) {
  const [label, setLabel] = useState("");
  const [color, setColor] = useState(COLORS[0].value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim() || selectedIds.length < 2) return;
    onConfirm(label.trim(), color);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -8, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -6, scale: 0.98 }}
      transition={{ duration: 0.18, ease: EASE }}
      className="absolute left-full top-0 z-50 ml-2.5 w-72 overflow-hidden rounded-2xl border border-white/[0.07] bg-zinc-900/95 shadow-2xl backdrop-blur-md"
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <Layers className="h-3.5 w-3.5 text-zinc-500" />
        <span className="flex-1 text-sm font-medium text-zinc-200">Create group</span>
        <button
          onClick={onCancel}
          className="flex h-6 w-6 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-white/[0.06] hover:text-zinc-300"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
        {/* Selected nodes preview */}
        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-600">
            {selectedIds.length} node{selectedIds.length !== 1 ? "s" : ""} selected
          </p>
          <div className="flex flex-wrap gap-1.5">
            {selectedIds.map((id) => (
              <span
                key={id}
                className="rounded-md border border-white/[0.07] bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400"
              >
                {nodeNames[id] ?? id.slice(0, 8)}
              </span>
            ))}
          </div>
          {selectedIds.length < 2 && (
            <p className="mt-2 text-[11px] text-zinc-500">Select at least 2 nodes to create a group.</p>
          )}
        </div>

        {/* Label */}
        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-zinc-600">
            Group label
          </label>
          <input
            ref={inputRef}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Budget tier"
            className="w-full rounded-lg border border-white/[0.07] bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-700 outline-none focus:border-[#2dd4bf]/40"
          />
        </div>

        {/* Color */}
        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-600">Color</p>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                title={c.label}
                style={{ background: c.value }}
                className={[
                  "h-6 w-6 rounded-full transition-transform",
                  color === c.value
                    ? "scale-125 ring-2 ring-white/40 ring-offset-1 ring-offset-zinc-900"
                    : "hover:scale-110",
                ].join(" ")}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-white/[0.07] py-2 text-sm text-zinc-500 transition-colors hover:border-white/[0.12] hover:text-zinc-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!label.trim() || selectedIds.length < 2}
            className="flex-1 rounded-lg bg-zinc-700 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-600 disabled:opacity-40"
          >
            Create group
          </button>
        </div>
      </form>
    </motion.div>
  );
}
