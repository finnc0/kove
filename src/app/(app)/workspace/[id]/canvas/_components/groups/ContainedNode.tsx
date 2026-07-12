"use client";

import type { CanvasAppNode } from "../types";

interface Props {
  node: CanvasAppNode;
  onDragOut: (nodeId: string, screenPos: { x: number; y: number }) => void;
  onNodeClick: (nodeId: string) => void;
}

const EJECT_THRESHOLD = 64;

const VERDICT_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  strong:  { bg: "rgba(45,212,191,0.12)", text: "#2dd4bf", label: "Strong" },
  partial: { bg: "rgba(251,191,36,0.12)", text: "#fbbf24", label: "Partial" },
  crowded: { bg: "rgba(239,68,68,0.12)",  text: "#f87171", label: "Crowded" },
};

export function ContainedNode({ node, onDragOut, onNodeClick }: Props) {
  const isIdea = node.memberType === "idea";

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.stopPropagation();

    const containerEl = (e.currentTarget as HTMLElement).closest(
      "[data-group-container]",
    ) as HTMLElement | null;
    if (!containerEl) return;

    let ejected = false;

    const onPointerMove = (me: PointerEvent) => {
      if (ejected) return;
      const rect = containerEl.getBoundingClientRect();
      const outside =
        me.clientX < rect.left - EJECT_THRESHOLD ||
        me.clientX > rect.right + EJECT_THRESHOLD ||
        me.clientY < rect.top - EJECT_THRESHOLD ||
        me.clientY > rect.bottom + EJECT_THRESHOLD;
      if (outside) {
        ejected = true;
        cleanup();
        onDragOut(node.id, { x: me.clientX, y: me.clientY });
      }
    };

    const cleanup = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    const onPointerUp = () => {
      cleanup();
      if (!ejected) onNodeClick(node.id);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp, { once: true });
  }

  // ── Idea member ────────────────────────────────────────────────────────────
  if (isIdea) {
    const verdict = node.ideaVerdict ?? null;
    const vs = verdict ? VERDICT_STYLE[verdict] : null;

    return (
      <div
        className="nodrag nopan flex cursor-grab select-none items-start gap-2.5 rounded-xl bg-zinc-800/50 px-3 py-2.5 transition-colors hover:bg-zinc-800/80 active:cursor-grabbing"
        onPointerDown={handlePointerDown}
      >
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-sm text-violet-400">
          ✦
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-xs leading-snug text-white/85">
            {node.ideaText || node.name || "Untitled idea"}
          </p>
          {vs && (
            <span
              className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ background: vs.bg, color: vs.text }}
            >
              {vs.label}
            </span>
          )}
        </div>
      </div>
    );
  }

  // ── Competitor member ──────────────────────────────────────────────────────
  const statusColor =
    node.nodeStatus === "analyzing"
      ? "#f59e0b"
      : node.nodeStatus === "complete"
        ? "#2dd4bf"
        : node.nodeStatus === "failed"
          ? "#ef4444"
          : "#3f3f46";

  return (
    <div
      className="nodrag nopan flex cursor-grab select-none items-center gap-2.5 rounded-xl bg-zinc-800/50 px-3 py-2 transition-colors hover:bg-zinc-800/80 active:cursor-grabbing"
      onPointerDown={handlePointerDown}
    >
      {node.iconUrl ? (
        <img
          src={node.iconUrl}
          className="h-7 w-7 shrink-0 rounded-lg object-cover"
          alt=""
          draggable={false}
        />
      ) : (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-700 text-[10px] font-bold text-zinc-400">
          {node.name.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-snug text-white">{node.name}</p>
        <p className="truncate text-xs leading-snug text-zinc-500">
          {node.category ?? node.nodeStatus}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {node.rating !== null && (
          <span className="text-xs tabular-nums text-zinc-500">
            {node.rating.toFixed(1)}
          </span>
        )}
        <span
          className="block h-1.5 w-1.5 rounded-full"
          style={{ background: statusColor }}
        />
      </div>
    </div>
  );
}
