"use client";

import { Trash2, GripVertical } from "lucide-react";
import { TYPE_STYLES } from "./types";
import type { OFScreen, OFTier } from "./types";

interface Props {
  screen: OFScreen;
  tiers: OFTier[];
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  dragHandleProps?: {
    draggable: boolean;
    onDragStart: (e: React.DragEvent) => void;
  };
}

export function OFScreenCard({ screen, tiers, isSelected, onSelect, onDelete, dragHandleProps }: Props) {
  const tier = tiers.find((t) => t.id === screen.paywallTierId);

  return (
    <div
      className={[
        "group relative flex items-start gap-2 rounded-xl border p-3 cursor-pointer transition-colors",
        isSelected
          ? "border-[#2dd4bf]/30 bg-[#2dd4bf]/[0.04]"
          : "border-white/[0.06] bg-zinc-900/60 hover:border-white/[0.12]",
      ].join(" ")}
      onClick={onSelect}
    >
      {/* Drag handle */}
      <div
        className="mt-0.5 shrink-0 cursor-grab text-zinc-700 hover:text-zinc-500 active:cursor-grabbing"
        {...dragHandleProps}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Step number */}
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-zinc-800 text-[10px] font-semibold text-zinc-500">
        {screen.order + 1}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-white truncate">{screen.title}</p>
          <span className={[
            "rounded-full border px-1.5 py-0.5 text-[10px] font-medium shrink-0",
            TYPE_STYLES[screen.type] ?? TYPE_STYLES.custom,
          ].join(" ")}>
            {screen.type}
          </span>
          {tier && (
            <span className="rounded-full border border-[#2dd4bf]/20 bg-[#2dd4bf]/[0.06] px-1.5 py-0.5 text-[10px] text-[#2dd4bf]">
              {tier.name}
            </span>
          )}
        </div>
        {screen.purpose && (
          <p className="mt-0.5 text-xs text-zinc-500 truncate">{screen.purpose}</p>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="shrink-0 rounded p-0.5 text-zinc-700 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
