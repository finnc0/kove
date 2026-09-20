"use client";

import { Filter } from "lucide-react";

const CATEGORIES = [
  { value: "core",         label: "Core" },
  { value: "nice-to-have", label: "Nice-to-have" },
  { value: "future",       label: "Future" },
];

interface Props {
  value: string | null;
  onChange: (v: string | null) => void;
  mvpOnly: boolean;
  onMvpToggle: () => void;
}

export function CategoryFilter({ value, onChange, mvpOnly, onMvpToggle }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={onMvpToggle}
        className={[
          "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all",
          mvpOnly
            ? "border-[#2dd4bf]/30 bg-[#2dd4bf]/[0.08] text-[#2dd4bf]"
            : "border-white/[0.06] bg-zinc-900 text-zinc-500 hover:text-zinc-300",
        ].join(" ")}
      >
        MVP
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(value === cat.value ? null : cat.value)}
          className={[
            "rounded-lg border px-2.5 py-1.5 text-xs transition-all",
            value === cat.value
              ? "border-white/[0.16] bg-zinc-800 text-white font-medium"
              : "border-white/[0.06] bg-zinc-900 text-zinc-500 hover:text-zinc-300",
          ].join(" ")}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
