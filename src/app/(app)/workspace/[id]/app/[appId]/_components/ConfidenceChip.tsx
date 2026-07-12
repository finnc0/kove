type Confidence = "very_low" | "low" | "medium" | "medium_high" | "high";

const CONFIG: Record<Confidence, { label: string; className: string }> = {
  very_low:    { label: "Very low confidence",    className: "border-zinc-700 bg-zinc-800/60 text-zinc-500" },
  low:         { label: "Low confidence",          className: "border-zinc-700 bg-zinc-800/60 text-zinc-500" },
  medium:      { label: "Medium confidence",       className: "border-zinc-600/30 bg-zinc-700/20 text-zinc-400" },
  medium_high: { label: "Medium-high confidence",  className: "border-teal-500/20 bg-teal-500/[0.07] text-teal-400/80" },
  high:        { label: "High confidence",          className: "border-teal-500/30 bg-teal-500/10 text-teal-400" },
};

export function ConfidenceChip({ level }: { level: string }) {
  const cfg = CONFIG[level as Confidence] ?? CONFIG.low;
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
        cfg.className,
      ].join(" ")}
    >
      {cfg.label}
    </span>
  );
}
