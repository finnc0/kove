import { ArrowRight } from "lucide-react";
import type { Gap } from "./mockData";

function GapCard({ gap, index }: { gap: Gap; index: number }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="flex items-start gap-3">
        <span className="text-xs font-mono text-zinc-700 shrink-0 pt-0.5">{String(index + 1).padStart(2, "0")}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white mb-2">{gap.title}</p>
          <p className="text-xs text-zinc-500 leading-relaxed mb-3">{gap.evidence}</p>

          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
              {gap.relatedPainPoints.map((p) => (
                <span key={p} className="text-xs text-zinc-600 bg-white/[0.04] border border-white/[0.05] rounded-full px-2 py-0.5 truncate max-w-[180px]">{p}</span>
              ))}
            </div>
            <button
              onClick={() => document.getElementById("opportunity-scores")?.scrollIntoView({ behavior: "smooth" })}
              className="shrink-0 flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
            >
              Score <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GapAnalysis({ gaps }: { gaps: Gap[] }) {
  return (
    <section id="gap-analysis" className="mb-14">
      <p className="text-xs font-medium text-zinc-700 uppercase tracking-widest mb-1">05</p>
      <h2 className="text-base font-semibold text-white mb-6">Gap Analysis</h2>
      <div className="space-y-2.5">
        {gaps.map((g, i) => <GapCard key={g.title} gap={g} index={i} />)}
      </div>
    </section>
  );
}
