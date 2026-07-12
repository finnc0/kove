"use client";

import { useRef, useState } from "react";
import { type NodeProps, NodeResizer } from "@xyflow/react";
import { MoreHorizontal, X } from "lucide-react";

export const ZONE_COLORS = {
  zinc:   { bg: "rgba(24,24,27,0.5)",    border: "#3f3f46", tint: "#71717a" },
  teal:   { bg: "rgba(20,184,166,0.06)", border: "#14b8a6", tint: "#2dd4bf" },
  amber:  { bg: "rgba(245,158,11,0.06)", border: "#d97706", tint: "#f59e0b" },
  violet: { bg: "rgba(139,92,246,0.06)", border: "#7c3aed", tint: "#a78bfa" },
} as const;

export type ZoneColor = keyof typeof ZONE_COLORS;

export interface GroupZoneData extends Record<string, unknown> {
  groupId: string;
  label: string;
  color: ZoneColor;
  nodeIds: string[];
  onLabelChange: (groupId: string, label: string) => void;
  onColorChange: (groupId: string, color: ZoneColor) => void;
  onDelete: (groupId: string) => void;
  onResizeEnd: (groupId: string, x: number, y: number, w: number, h: number) => void;
}

export function GroupZone({ data, selected }: NodeProps) {
  const d = data as unknown as GroupZoneData;
  const colors = ZONE_COLORS[d.color] ?? ZONE_COLORS.zinc;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(d.label);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function commitLabel() {
    const trimmed = draft.trim() || "New group";
    setDraft(trimmed);
    d.onLabelChange(d.groupId, trimmed);
    setEditing(false);
  }

  const count = (d.nodeIds as string[]).length;

  return (
    <div
      className="relative h-full w-full rounded-2xl"
      style={{
        background: colors.bg,
        border: `1.5px ${selected ? "solid" : "dashed"} ${selected ? colors.tint : colors.border}`,
        boxShadow: selected ? `0 0 0 1px ${colors.tint}22` : "none",
      }}
    >
      <NodeResizer
        minWidth={200}
        minHeight={150}
        onResizeEnd={(_, params) =>
          d.onResizeEnd(d.groupId, params.x, params.y, params.width, params.height)
        }
        lineStyle={{ border: "none" }}
        handleStyle={{
          width: 8,
          height: 8,
          borderRadius: 3,
          background: colors.tint,
          border: "none",
          opacity: selected ? 1 : 0,
        }}
      />

      {/* Header */}
      <div className="absolute left-3 top-2.5 flex items-center gap-2">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitLabel}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitLabel();
              if (e.key === "Escape") {
                setDraft(d.label);
                setEditing(false);
              }
              e.stopPropagation();
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="nodrag nopan min-w-0 rounded bg-transparent px-1 text-sm font-medium text-white/90 outline-none ring-1 ring-white/20 focus:ring-white/40"
            style={{ width: Math.max(80, draft.length * 8 + 16) }}
            autoFocus
          />
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDraft(d.label);
              setEditing(true);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="nodrag nopan rounded px-1 text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            {d.label}
          </button>
        )}

        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] text-zinc-500"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {count > 0 ? `${count} app${count !== 1 ? "s" : ""}` : "empty"}
        </span>
      </div>

      {/* Menu button */}
      <div className="absolute right-2 top-1.5">
        {confirmDelete ? (
          <div
            className="nodrag nopan absolute right-0 top-0 z-50 w-52 rounded-xl border border-white/[0.07] bg-zinc-900 p-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <p className="mb-2.5 text-xs text-zinc-300">
              Delete this group? Nodes stay on the canvas.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => d.onDelete(d.groupId)}
                className="flex-1 rounded-lg bg-red-500 py-1.5 text-xs font-medium text-white hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 rounded-lg border border-white/[0.07] py-1.5 text-xs text-zinc-500 hover:text-zinc-300"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="nodrag nopan flex h-6 w-6 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-white/[0.06] hover:text-zinc-300"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>

            {menuOpen && (
              <div
                className="nodrag nopan absolute right-0 top-7 z-50 w-44 overflow-hidden rounded-xl border border-white/[0.07] bg-zinc-900 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="border-b border-white/[0.06] px-3 py-2.5">
                  <p className="mb-2 text-[9px] font-semibold uppercase tracking-widest text-zinc-600">
                    Color
                  </p>
                  <div className="flex gap-1.5">
                    {(["zinc", "teal", "amber", "violet"] as ZoneColor[]).map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          d.onColorChange(d.groupId, c);
                          setMenuOpen(false);
                        }}
                        style={{ background: ZONE_COLORS[c].tint }}
                        className={`h-5 w-5 rounded-full transition-transform hover:scale-110 ${
                          d.color === c
                            ? "ring-2 ring-white/40 ring-offset-1 ring-offset-zinc-900"
                            : ""
                        }`}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmDelete(true);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-red-400"
                >
                  <X className="h-3.5 w-3.5" />
                  Delete zone
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
