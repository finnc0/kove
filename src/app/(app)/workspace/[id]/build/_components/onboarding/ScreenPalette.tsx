"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { ScreenShell } from "./ScreenShell";

// Full palette cards built in Phase 3
const PALETTES = [
  {
    value: "zinc-teal",
    name: "Zinc + Teal",
    swatches: ["#18181b", "#27272a", "#2dd4bf"],
  },
  {
    value: "slate-violet",
    name: "Slate + Violet",
    swatches: ["#0f172a", "#1e293b", "#8b5cf6"],
  },
  {
    value: "warm-neutral",
    name: "Warm Neutral",
    swatches: ["#1c1917", "#292524", "#d97706"],
  },
  {
    value: "midnight-sky",
    name: "Midnight + Sky",
    swatches: ["#0a0a14", "#0f172a", "#38bdf8"],
  },
  {
    value: "mono-lime",
    name: "Mono + Lime",
    swatches: ["#111111", "#1a1a1a", "#84cc16"],
  },
  {
    value: "ink-coral",
    name: "Ink + Coral",
    swatches: ["#0d0d0d", "#1a1a1a", "#f87171"],
  },
] as const;

interface Props {
  initialValue: string;
  onAdvance: (value: string) => void;
  saving?: boolean;
}

export function ScreenPalette({ initialValue, onAdvance, saving }: Props) {
  const [selected, setSelected] = useState(initialValue);

  return (
    <ScreenShell
      question="Which feels right?"
      hint="A design direction for your app — not final, just a starting point."
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {PALETTES.map((palette) => {
          const isSelected = selected === palette.value;
          return (
            <button
              key={palette.value}
              onClick={() => {
                setSelected(palette.value);
                onAdvance(palette.value);
              }}
              disabled={saving}
              className={[
                "flex flex-col gap-3 rounded-xl border p-4 text-left transition-all",
                isSelected
                  ? "border-[#2dd4bf]/50 bg-[#2dd4bf]/[0.04] ring-1 ring-[#2dd4bf]/30"
                  : "border-white/[0.06] bg-zinc-900 hover:border-white/[0.16]",
              ].join(" ")}
            >
              {/* Swatch chips */}
              <div className="flex gap-1.5">
                {palette.swatches.map((color, i) => (
                  <span
                    key={i}
                    className="h-5 w-5 rounded-full border border-white/[0.08]"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <p className="text-xs font-medium text-zinc-300">{palette.name}</p>
            </button>
          );
        })}
      </div>

      {saving && (
        <div className="flex items-center justify-center gap-2 pt-2 text-xs text-zinc-600">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Saving…
        </div>
      )}
    </ScreenShell>
  );
}
