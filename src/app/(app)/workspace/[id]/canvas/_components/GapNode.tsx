"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Lock, RefreshCw } from "lucide-react";

export interface GapNodeData {
  gapTitle: string;
  opportunity: string;
  appCount: number;
  ready: boolean;
  needed: number;
  onRefresh?: () => void;
  refreshing?: boolean;
}

const HANDLE_STYLE: React.CSSProperties = {
  background: "transparent",
  border: "none",
  width: 6,
  height: 6,
  minWidth: 6,
  minHeight: 6,
};

export function GapNode({ data }: NodeProps) {
  const d = data as unknown as GapNodeData;

  if (!d.ready) {
    return (
      <>
        <Handle type="source" position={Position.Top} style={HANDLE_STYLE} />
        <Handle type="source" position={Position.Right} id="right" style={HANDLE_STYLE} />
        <Handle type="target" position={Position.Bottom} style={HANDLE_STYLE} />
        <Handle type="target" position={Position.Left} id="left" style={HANDLE_STYLE} />

        <div className="flex w-52 flex-col items-center gap-3 rounded-2xl border border-dashed border-white/[0.08] bg-zinc-950/60 px-5 py-6 text-center">
          <Lock className="h-4 w-4 text-zinc-700" />
          <div>
            <p className="text-xs font-medium text-zinc-600">The gap</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-700">
              Add {d.needed} more app{d.needed === 1 ? "" : "s"} to reveal.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Handle type="source" position={Position.Top} style={HANDLE_STYLE} />
      <Handle type="source" position={Position.Right} id="right" style={HANDLE_STYLE} />
      <Handle type="target" position={Position.Bottom} style={HANDLE_STYLE} />
      <Handle type="target" position={Position.Left} id="left" style={HANDLE_STYLE} />

      <div
        className="relative w-52 overflow-hidden rounded-2xl border border-[#2dd4bf]/25 bg-zinc-900 px-5 py-5"
        style={{
          boxShadow:
            "0 0 0 1px rgba(45,212,191,0.1), 0 0 24px rgba(45,212,191,0.12)",
        }}
      >
        {/* Radial glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 60% at 50% 110%, rgba(45,212,191,0.1) 0%, transparent 70%)",
          }}
        />

        <div className="relative mb-2 flex items-center justify-between">
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#2dd4bf]/70">
            The gap
          </p>
          {d.onRefresh && (
            <button
              onClick={(e) => { e.stopPropagation(); d.onRefresh?.(); }}
              disabled={d.refreshing}
              className="nodrag flex h-5 w-5 items-center justify-center rounded-md text-zinc-600 transition-colors hover:text-zinc-300 disabled:opacity-40"
              title="Refresh gap analysis"
            >
              <RefreshCw className={`h-3 w-3 ${d.refreshing ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>
        <p className="relative mb-2 text-sm font-semibold leading-snug text-white">
          {d.refreshing ? "Reanalyzing…" : d.gapTitle}
        </p>
        <p className="relative mb-4 text-xs leading-relaxed text-zinc-500">
          {d.refreshing ? "This takes about 15–30 seconds." : d.opportunity}
        </p>
        <p className="text-[10px] text-zinc-500">
          across {d.appCount} app{d.appCount === 1 ? "" : "s"}
        </p>
      </div>
    </>
  );
}
