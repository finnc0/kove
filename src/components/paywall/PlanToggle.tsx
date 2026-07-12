"use client";

interface Props {
  value: "monthly" | "annual";
  onChange: (v: "monthly" | "annual") => void;
}

export function PlanToggle({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-white/[0.06] bg-zinc-800 p-0.5">
      <button
        onClick={() => onChange("monthly")}
        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
          value === "monthly"
            ? "bg-zinc-700 text-white shadow-sm"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        Monthly
      </button>
      <button
        onClick={() => onChange("annual")}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
          value === "annual"
            ? "bg-zinc-700 text-white shadow-sm"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        Annual
        <span className="rounded px-1 py-px text-[10px] font-semibold text-[#2dd4bf]">
          –35%
        </span>
      </button>
    </div>
  );
}
