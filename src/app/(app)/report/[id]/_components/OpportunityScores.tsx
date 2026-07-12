import { cn } from "@/lib/utils";
import type { Opportunity } from "./mockData";

function ScoreRow({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-zinc-600 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-px bg-white/[0.06] rounded-full overflow-hidden">
        <div className="h-full bg-white/30 rounded-full" style={{ width: `${(score / 5) * 100}%` }} />
      </div>
      <span className="text-xs text-zinc-500 w-4 text-right tabular-nums">{score}</span>
    </div>
  );
}

export function OpportunityScores({ opportunities }: { opportunities: Opportunity[] }) {
  const sorted = [...opportunities].sort(
    (a, b) => (b.marketSize + b.buildEffort + b.moat) - (a.marketSize + a.buildEffort + a.moat)
  );

  return (
    <section id="opportunity-scores" className="mb-14">
      <p className="text-xs font-medium text-zinc-700 uppercase tracking-widest mb-1">06</p>
      <h2 className="text-base font-semibold text-white mb-6">Opportunity Scores</h2>

      <div className="space-y-2.5">
        {sorted.map((opp, i) => {
          const total = opp.marketSize + opp.buildEffort + opp.moat;
          return (
            <div key={opp.id} className={cn("rounded-xl border p-5", i === 0 ? "border-white/[0.1] bg-white/[0.03]" : "border-white/[0.06] bg-white/[0.02]")}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-zinc-700">{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-sm font-semibold text-white">{opp.title}</p>
                </div>
                <span className="text-sm font-semibold text-white tabular-nums">{total}<span className="text-zinc-600 font-normal">/15</span></span>
              </div>
              <div className="space-y-2">
                <ScoreRow label="Market size" score={opp.marketSize} />
                <ScoreRow label="Build effort" score={opp.buildEffort} />
                <ScoreRow label="Moat" score={opp.moat} />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-zinc-700 mt-3">Market Size = demand signal · Build Effort = lower is easier · Moat = defensibility</p>
    </section>
  );
}
