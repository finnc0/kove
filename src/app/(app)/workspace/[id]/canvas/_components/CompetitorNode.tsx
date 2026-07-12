"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { CanvasAppNode } from "./types";

const HANDLE_STYLE: React.CSSProperties = {
  background: "transparent",
  border: "none",
  width: 6,
  height: 6,
  minWidth: 6,
  minHeight: 6,
};

export function CompetitorNode({ data, selected }: NodeProps) {
  const d = data as unknown as CanvasAppNode;
  const isAnalyzing = d.nodeStatus === "analyzing" || d.nodeStatus === "pending";
  const isFailed = d.nodeStatus === "failed";
  const isComplete = d.nodeStatus === "complete";

  return (
    <>
      <Handle type="source" position={Position.Top} style={HANDLE_STYLE} />
      <Handle type="source" position={Position.Right} id="right" style={HANDLE_STYLE} />
      <Handle type="target" position={Position.Bottom} style={HANDLE_STYLE} />
      <Handle type="target" position={Position.Left} id="left" style={HANDLE_STYLE} />

      <div
        className={[
          "w-60 rounded-2xl border bg-zinc-900 px-4 py-4 shadow-xl shadow-black/40",
          "transition-colors duration-150",
          selected
            ? "border-[#2dd4bf]/40 shadow-[0_0_0_1px_rgba(45,212,191,0.25)]"
            : "border-white/[0.07] hover:border-white/[0.15]",
        ].join(" ")}
      >
        {/* Header */}
        <div className="mb-3 flex items-start gap-2.5">
          {d.iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={d.iconUrl}
              className="h-9 w-9 shrink-0 rounded-xl object-cover"
              alt=""
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-zinc-800 text-xs font-semibold text-zinc-400">
              {d.name[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="truncate text-sm font-semibold leading-tight text-white">
              {d.name}
            </p>
            <p className="truncate text-xs text-zinc-500">
              {d.category ?? "App"}
            </p>
          </div>
        </div>

        <div className="h-px bg-white/[0.05]" />

        {isAnalyzing && (
          <p className="mt-3 text-xs text-zinc-500">analyzing…</p>
        )}

        {isFailed && (
          <p className="mt-3 text-xs text-zinc-600">couldn&apos;t fetch data</p>
        )}

        {isComplete && (
          <>
            {/* Downloads + Revenue */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <p className="text-base font-bold tabular-nums text-white">
                  {d.downloadsFormatted ?? "—"}
                </p>
                <p className="text-[10px] text-zinc-600">downloads/mo</p>
              </div>
              <div>
                <p className="text-base font-bold tabular-nums text-white">
                  {d.revenueFormatted ? `$${d.revenueFormatted}` : "—"}
                </p>
                <p className="text-[10px] text-zinc-600">revenue/mo</p>
              </div>
            </div>

            {/* Rating + price row */}
            <p className="mt-2.5 text-xs text-zinc-500">
              {[
                d.rating ? `★ ${d.rating.toFixed(1)}` : null,
                d.primaryPrice ?? null,
              ]
                .filter(Boolean)
                .join(" · ") || "—"}
            </p>

          </>
        )}
      </div>
    </>
  );
}
