"use client";

import type { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  label: string;
  shortcut?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function ToolButton({ icon, label, shortcut, active, disabled, onClick }: Props) {
  return (
    <div className="group relative">
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={[
          "flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-150",
          active
            ? "bg-[#2dd4bf]/10 text-[#2dd4bf] ring-1 ring-[#2dd4bf]/40"
            : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200",
          disabled ? "cursor-not-allowed opacity-30" : "cursor-pointer",
        ].join(" ")}
      >
        {icon}
      </button>

      {/* Tooltip — appears to the right */}
      <div
        className="
          pointer-events-none absolute left-full top-1/2 z-50 ml-2.5
          -translate-y-1/2 opacity-0 transition-opacity
          duration-150 delay-200 group-hover:opacity-100
        "
      >
        <div className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/[0.06] bg-zinc-900 px-2.5 py-1.5 shadow-xl">
          <span className="text-xs text-zinc-300">{label}</span>
          {shortcut && (
            <kbd className="rounded bg-zinc-800 px-1.5 py-px text-[10px] font-mono text-zinc-500">
              {shortcut}
            </kbd>
          )}
        </div>
      </div>
    </div>
  );
}
