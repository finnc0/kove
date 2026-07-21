"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FeatureCard } from "./FeatureCard";
import type { Feature, ColumnId } from "./FeatureBoard";

const EASE = [0.22, 1, 0.36, 1] as const;

interface Column { id: ColumnId; label: string }

interface Props {
  column: Column;
  features: Feature[];
  workspaceId: string;
  onPatch: (id: string, patch: Partial<Feature>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onMove: (id: string, columnId: ColumnId) => Promise<void>;
}

export function KanbanColumn({ column, features, workspaceId, onPatch, onDelete, onMove }: Props) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const featureId = e.dataTransfer.getData("featureId");
    if (featureId) onMove(featureId, column.id);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={[
        "flex w-72 shrink-0 flex-col gap-3 rounded-xl border p-3 transition-colors",
        dragOver
          ? "border-[#2dd4bf]/30 bg-[#2dd4bf]/[0.03]"
          : "border-white/[0.06] bg-zinc-900/40",
      ].join(" ")}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-semibold text-zinc-400">{column.label}</p>
        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">
          {features.length}
        </span>
      </div>

      {/* Cards */}
      <AnimatePresence>
        {features.map((feature) => (
          <motion.div
            key={feature.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: EASE }}
          >
            <FeatureCard
              feature={feature}
              workspaceId={workspaceId}
              onPatch={(patch) => onPatch(feature.id, patch)}
              onDelete={() => onDelete(feature.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {features.length === 0 && (
        <div
          className={[
            "rounded-lg border border-dashed py-6 text-center text-xs text-zinc-700 transition-colors",
            dragOver ? "border-[#2dd4bf]/30" : "border-white/[0.06]",
          ].join(" ")}
        >
          Drop here
        </div>
      )}
    </div>
  );
}
