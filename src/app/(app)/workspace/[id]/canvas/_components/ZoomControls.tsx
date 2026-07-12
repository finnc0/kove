"use client";

import { Maximize2, Minus, Plus } from "lucide-react";
import { useViewport, useReactFlow } from "@xyflow/react";
import { useReducedMotion } from "framer-motion";

function ControlBtn({
  onClick,
  children,
  title,
  className = "",
}: {
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={[
        "flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500",
        "transition-colors hover:bg-white/[0.06] hover:text-zinc-200",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function ZoomControls() {
  const { zoom } = useViewport();
  const { zoomIn, zoomOut, zoomTo, fitView } = useReactFlow();
  const reduced = useReducedMotion();
  const dur = reduced ? 0 : 200;

  const pct = Math.round(zoom * 100);

  return (
    <div className="mb-2 mr-2 flex items-center gap-0.5 rounded-xl border border-white/[0.06] bg-zinc-900/90 p-1 shadow-xl backdrop-blur-md">
      <ControlBtn onClick={() => zoomOut({ duration: dur })} title="Zoom out (−)">
        <Minus className="h-3.5 w-3.5" />
      </ControlBtn>

      <button
        onClick={() => zoomTo(1, { duration: dur })}
        title="Reset zoom to 100%"
        className="min-w-[3rem] rounded-lg px-2 py-1.5 text-center text-xs font-medium tabular-nums text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-zinc-200"
      >
        {pct}%
      </button>

      <ControlBtn onClick={() => zoomIn({ duration: dur })} title="Zoom in (+)">
        <Plus className="h-3.5 w-3.5" />
      </ControlBtn>

      <div className="mx-0.5 h-4 w-px bg-white/[0.06]" />

      <ControlBtn
        onClick={() => fitView({ padding: 0.28, duration: reduced ? 0 : 400 })}
        title="Fit view (⌘0)"
      >
        <Maximize2 className="h-3.5 w-3.5" />
      </ControlBtn>
    </div>
  );
}
