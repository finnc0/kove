"use client";

import { type NodeProps } from "@xyflow/react";
import { X } from "lucide-react";

export interface GroupOverlayData extends Record<string, unknown> {
  label: string;
  color: string;
  groupId: string;
  onDelete?: (groupId: string) => void;
}

export function GroupOverlay({ data, selected }: NodeProps) {
  const d = data as unknown as GroupOverlayData;

  return (
    <div
      className="group relative h-full w-full rounded-2xl"
      style={{
        border: `1.5px solid ${d.color}55`,
        background: `${d.color}0d`,
      }}
    >
      {/* Label badge */}
      <div
        className="absolute -top-3 left-3 flex items-center gap-1.5 rounded-full px-2.5 py-0.5"
        style={{ background: d.color }}
      >
        <span className="text-[11px] font-semibold text-white">{d.label}</span>
      </div>

      {/* Delete button — shows on hover */}
      {d.onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); d.onDelete!(d.groupId); }}
          className="absolute -top-3 right-2 hidden h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-white group-hover:flex"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </div>
  );
}
