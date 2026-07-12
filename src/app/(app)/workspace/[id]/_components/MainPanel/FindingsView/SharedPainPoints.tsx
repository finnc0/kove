interface FindingsPainPoint { title: string; severity: "High" | "Medium" | "Low"; quote: string; app: string; appIcon?: string; }

function SeverityDot({ s }: { s: "High" | "Medium" | "Low" }) {
  return (
    <span className={`text-xs ${s === "High" ? "text-zinc-200" : s === "Medium" ? "text-zinc-400" : "text-zinc-600"}`}>
      {s}
    </span>
  );
}

export function SharedPainPoints({ painPoints }: { painPoints: FindingsPainPoint[] }) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-white">Pain Points</h2>
        <span className="text-xs text-zinc-600">{painPoints.length} identified</span>
      </div>
      <div className="space-y-2.5">
        {painPoints.map((pp, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-sm font-medium text-white leading-snug">{pp.title}</p>
              <SeverityDot s={pp.severity} />
            </div>
            <p className="text-xs text-zinc-500 italic leading-relaxed border-l-2 border-white/[0.08] pl-3 mb-2">
              &ldquo;{pp.quote}&rdquo;
            </p>
            <div className="flex items-center gap-1.5">
              {pp.appIcon && (
                <img src={pp.appIcon} alt="" className="w-3.5 h-3.5 rounded-[3px] object-cover" />
              )}
              <span className="text-xs text-zinc-600">{pp.app}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
