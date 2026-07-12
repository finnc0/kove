const LABELS = ["", "Weak", "Moderate", "Strong", "Very Strong", "Maximum"];

interface Props {
  analyzedCount: number;
}

export function ConfidenceBar({ analyzedCount }: Props) {
  const filled = Math.min(analyzedCount, 5);
  const label = LABELS[filled] ?? "Maximum";

  return (
    <div className="mb-8 pb-6 border-b border-white/[0.06]">
      <p className="text-[10px] font-semibold tracking-widest text-zinc-600 uppercase mb-3">
        Workspace Intelligence
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">
          Based on {analyzedCount} app{analyzedCount === 1 ? "" : "s"} analyzed
        </span>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${i < filled ? "bg-white" : "bg-white/[0.10]"}`}
            />
          ))}
          <span className="text-xs text-zinc-500 ml-2">{label}</span>
        </div>
      </div>
    </div>
  );
}
