"use client";

import { useRef, useState } from "react";
import { NodeResizer, type NodeProps } from "@xyflow/react";
import { ChevronDown, ChevronRight, MoreHorizontal, X } from "lucide-react";
import { ContainedNode } from "./ContainedNode";
import { HEADER_H } from "./snapLayout";
import type { CanvasAppNode } from "../types";

export const CONTAINER_COLORS = {
  zinc: {
    bg: "rgba(28,28,31,0.82)",
    headerBg: "rgba(82,82,91,0.10)",
    border: "rgba(82,82,91,0.45)",
    accent: "#52525b",
    glow: "rgba(82,82,91,0.3)",
    dot: "#71717a",
    label: "Zinc",
  },
  teal: {
    bg: "rgba(5,34,30,0.82)",
    headerBg: "rgba(20,184,166,0.11)",
    border: "rgba(20,184,166,0.45)",
    accent: "#14b8a6",
    glow: "rgba(20,184,166,0.25)",
    dot: "#2dd4bf",
    label: "Teal",
  },
  amber: {
    bg: "rgba(38,24,5,0.82)",
    headerBg: "rgba(245,158,11,0.10)",
    border: "rgba(245,158,11,0.42)",
    accent: "#d97706",
    glow: "rgba(245,158,11,0.22)",
    dot: "#fbbf24",
    label: "Amber",
  },
  violet: {
    bg: "rgba(25,14,46,0.82)",
    headerBg: "rgba(139,92,246,0.10)",
    border: "rgba(139,92,246,0.42)",
    accent: "#7c3aed",
    glow: "rgba(139,92,246,0.25)",
    dot: "#a78bfa",
    label: "Violet",
  },
} as const;

export type ContainerColor = keyof typeof CONTAINER_COLORS;

export interface GroupContainerData extends Record<string, unknown> {
  groupId: string;
  label: string;
  color: ContainerColor;
  members: CanvasAppNode[];
  collapsed: boolean;
  dragOver: boolean;
  onLabelChange: (groupId: string, label: string) => void;
  onColorChange: (groupId: string, color: ContainerColor) => void;
  onCollapse: (groupId: string) => void;
  onUngroup: (groupId: string) => void;
  onDelete: (groupId: string) => void;
  onNodeEject: (groupId: string, nodeId: string, screenPos: { x: number; y: number }) => void;
  onMemberClick: (nodeId: string) => void;
}

export function GroupContainer({ data, selected }: NodeProps) {
  const d = data as unknown as GroupContainerData;
  const colors = CONTAINER_COLORS[d.color] ?? CONTAINER_COLORS.zinc;

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

  const count = d.members.length;

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={260}
        minHeight={56}
        lineStyle={{
          border: `1.5px dashed ${colors.border}`,
          borderRadius: "18px",
        }}
        handleStyle={{
          width: 9,
          height: 9,
          borderRadius: 3,
          background: colors.accent,
          border: `1px solid ${colors.border}`,
          opacity: 0.85,
        }}
      />

      <div
        data-group-container
        className="relative flex h-full w-full cursor-grab flex-col rounded-2xl active:cursor-grabbing"
        style={{
          background: colors.bg,
          border: `1.5px solid ${colors.border}`,
          boxShadow: d.dragOver
            ? `0 0 0 2px ${colors.accent}, 0 12px 40px rgba(0,0,0,0.5)`
            : `0 0 0 0px transparent, 0 8px 32px rgba(0,0,0,0.45)`,
          transition: "box-shadow 0.15s ease",
        }}
      >
        {/* ── Header ───────────────────────────────────────────────── */}
        <div
          className="flex shrink-0 items-center gap-2.5 px-4"
          style={{
            height: HEADER_H,
            background: colors.headerBg,
            borderBottom: d.collapsed ? "none" : `1px solid ${colors.border}`,
            borderRadius: d.collapsed ? "14px" : "14px 14px 0 0",
          }}
        >
          {/* Color dot */}
          <span
            className="block h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: colors.dot, boxShadow: `0 0 6px ${colors.glow}` }}
          />

          {/* Collapse toggle */}
          <button
            className="nodrag nopan flex h-5 w-5 shrink-0 items-center justify-center rounded text-zinc-600 transition-colors hover:text-zinc-300"
            onClick={(e) => { e.stopPropagation(); d.onCollapse(d.groupId); }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {d.collapsed
              ? <ChevronRight className="h-3.5 w-3.5" />
              : <ChevronDown className="h-3.5 w-3.5" />
            }
          </button>

          {/* Label */}
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitLabel}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitLabel();
                if (e.key === "Escape") { setDraft(d.label); setEditing(false); }
                e.stopPropagation();
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="nodrag nopan min-w-0 flex-1 rounded bg-transparent px-1 text-sm font-semibold text-white outline-none ring-1 ring-white/20 focus:ring-white/40"
              autoFocus
            />
          ) : (
            <button
              className="nodrag nopan min-w-0 flex-1 truncate text-left text-sm font-semibold text-white/90 transition-colors hover:text-white"
              onClick={(e) => { e.stopPropagation(); setDraft(d.label); setEditing(true); }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {d.label}
            </button>
          )}

          {/* Count chip */}
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ background: `${colors.accent}22`, color: colors.dot }}
          >
            {count} app{count !== 1 ? "s" : ""}
          </span>

          {/* ⋯ menu */}
          <div className="relative shrink-0">
            {confirmDelete ? (
              <div
                className="nodrag nopan absolute right-0 top-8 z-50 w-56 rounded-xl border border-white/[0.07] bg-zinc-950 p-3 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <p className="mb-2.5 text-xs text-zinc-300">
                  Delete this group? The apps inside return to the canvas.
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
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="nodrag nopan flex h-6 w-6 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-white/[0.06] hover:text-zinc-300"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>

                {menuOpen && (
                  <div
                    className="nodrag nopan absolute right-0 top-8 z-50 w-48 overflow-hidden rounded-xl border border-white/[0.07] bg-zinc-950 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    {/* Color picker */}
                    <div className="border-b border-white/[0.06] px-3 py-3">
                      <p className="mb-2 text-[9px] font-semibold uppercase tracking-widest text-zinc-600">
                        Color
                      </p>
                      <div className="flex gap-2">
                        {(Object.entries(CONTAINER_COLORS) as [ContainerColor, typeof CONTAINER_COLORS.zinc][]).map(([key, c]) => (
                          <button
                            key={key}
                            onClick={() => { d.onColorChange(d.groupId, key); setMenuOpen(false); }}
                            title={c.label}
                            style={{ background: c.dot }}
                            className={`h-5 w-5 rounded-full transition-transform hover:scale-110 ${
                              d.color === key
                                ? "ring-2 ring-white/50 ring-offset-1 ring-offset-zinc-950"
                                : ""
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => { setMenuOpen(false); d.onUngroup(d.groupId); }}
                      className="flex w-full items-center px-3 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-zinc-200"
                    >
                      Ungroup
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); setConfirmDelete(true); }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-red-400"
                    >
                      <X className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────── */}
        {!d.collapsed && (
          <div className="relative flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-3">
            {/* Drop zone overlay */}
            {d.dragOver && (
              <div
                className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-b-2xl"
                style={{
                  background: `${colors.accent}14`,
                  border: `2px dashed ${colors.border}`,
                  zIndex: 1,
                }}
              >
                <span className="rounded-full px-4 py-1.5 text-sm font-medium" style={{ color: colors.dot, background: `${colors.accent}22` }}>
                  Drop to add
                </span>
              </div>
            )}

            {count === 0 ? (
              <div
                className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-10"
                style={{ borderColor: colors.border, color: colors.dot, opacity: 0.45 }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ background: `${colors.accent}18` }}
                >
                  <span className="text-lg">+</span>
                </div>
                <p className="text-xs">Drag apps here</p>
              </div>
            ) : (
              d.members.map((member) => (
                <ContainedNode
                  key={member.id}
                  node={member}
                  onDragOut={(nodeId, pos) => d.onNodeEject(d.groupId, nodeId, pos)}
                  onNodeClick={(nodeId) => d.onMemberClick(nodeId)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
