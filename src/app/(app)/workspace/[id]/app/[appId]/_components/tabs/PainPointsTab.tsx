import type { ReportPageData } from "./types";

const SEVERITY_STYLES: Record<string, { dot: string; badge: string }> = {
  High:   { dot: "bg-red-500",    badge: "bg-red-500/15 text-red-400 border-red-500/20" },
  Medium: { dot: "bg-amber-500",  badge: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  Low:    { dot: "bg-green-500",  badge: "bg-green-500/15 text-green-400 border-green-500/20" },
};

export function PainPointsTab({ data }: { data: ReportPageData }) {
  const { report } = data;
  const items = report?.painPoints ?? [];

  if (items.length === 0) {
    return <p className="text-sm text-zinc-600">No pain points recorded for this app.</p>;
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">What users complain about</h3>
        <span className="text-[10px] text-zinc-600">{items.length} issues</span>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {items.map((pp, i) => {
          const styles = SEVERITY_STYLES[pp.severity] ?? SEVERITY_STYLES.Low;
          return (
            <div key={i} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3">
                <span className={["mt-1.5 h-2 w-2 shrink-0 rounded-full", styles.dot].join(" ")} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <p className="text-sm font-medium text-white">{pp.title}</p>
                    <span className={["shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium", styles.badge].join(" ")}>
                      {pp.severity}
                    </span>
                    {pp.reviewCount != null && pp.reviewCount > 0 && (
                      <span className="shrink-0 text-[10px] text-zinc-600">{pp.reviewCount} mentions</span>
                    )}
                  </div>
                  {pp.quote && (
                    <p className="text-sm italic leading-relaxed text-zinc-500">&ldquo;{pp.quote}&rdquo;</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
