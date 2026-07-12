import type { PainPoint, Severity } from "./mockData";

const severityConfig: Record<Severity, { border: string; text: string }> = {
  High:   { border: "border-l-zinc-400",   text: "text-zinc-300" },
  Medium: { border: "border-l-zinc-600",   text: "text-zinc-500" },
  Low:    { border: "border-l-zinc-700",   text: "text-zinc-600" },
};

function PainPointRow({ pp }: { pp: PainPoint }) {
  const { border, text } = severityConfig[pp.severity];

  return (
    <div className={`pl-4 border-l-2 ${border}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-xs font-mono text-zinc-700 shrink-0 pt-0.5">{String(pp.rank).padStart(2, "0")}</span>
          <p className="text-sm font-medium text-white leading-snug">{pp.title}</p>
        </div>
        <span className={`text-xs shrink-0 font-medium ${text}`}>{pp.severity}</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2 ml-6">
        {pp.sources.map((s) => (
          <span key={s} className="text-xs text-zinc-600 bg-white/[0.04] border border-white/[0.05] rounded-full px-2 py-0.5">{s}</span>
        ))}
      </div>
    </div>
  );
}

export function PainPoints({ painPoints }: { painPoints: PainPoint[] }) {
  return (
    <section id="pain-points" className="mb-14">
      <p className="text-xs font-medium text-zinc-700 uppercase tracking-widest mb-1">04</p>
      <h2 className="text-base font-semibold text-white mb-6">Pain Points</h2>
      <div className="space-y-5">
        {painPoints.map((pp) => <PainPointRow key={pp.rank} pp={pp} />)}
      </div>
    </section>
  );
}
