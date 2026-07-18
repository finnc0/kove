import type { ReportPageData } from "./types";

const SEVERITY_STYLES: Record<string, string> = {
  High:   "bg-red-500/15 text-red-400",
  Medium: "bg-amber-500/15 text-amber-400",
  Low:    "bg-green-500/15 text-green-400",
};

function PainMini({ title, severity }: { title: string; severity: string }) {
  return (
    <div className="flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0 border-b border-white/[0.04] last:border-0">
      <span className={["mt-0.5 shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium", SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.Low].join(" ")}>
        {severity}
      </span>
      <p className="text-sm text-zinc-300">{title}</p>
    </div>
  );
}

export function OverviewTab({ data }: { data: ReportPageData }) {
  const { report, facts } = data;
  if (!report) return null;

  const topPainPoints = report.painPoints?.slice(0, 3) ?? [];
  const topTiers      = report.pricingTiers?.slice(0, 2) ?? [];

  const platforms = report.platforms ?? [];

  return (
    <div className="space-y-6">
      {/* Description */}
      {report.description && (
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
          <p className="text-sm leading-relaxed text-zinc-300">{report.description}</p>
        </div>
      )}

      {/* Quick-facts strip */}
      <div className="flex flex-wrap gap-2">
        {platforms.map((p) => (
          <span key={p} className="rounded-full border border-white/[0.06] bg-zinc-900 px-3 py-1 text-xs text-zinc-400">{p}</span>
        ))}
        {data.category && (
          <span className="rounded-full border border-white/[0.06] bg-zinc-900 px-3 py-1 text-xs text-zinc-400">{data.category}</span>
        )}
        {facts?.version && (
          <span className="rounded-full border border-white/[0.06] bg-zinc-900 px-3 py-1 text-xs text-zinc-400">v{facts.version}</span>
        )}
        {facts != null && facts.languageCount > 0 && (
          <span className="rounded-full border border-white/[0.06] bg-zinc-900 px-3 py-1 text-xs text-zinc-400">{facts.languageCount} languages</span>
        )}
      </div>

      {/* Two-column: pain points + pricing */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top pain points */}
        {topPainPoints.length > 0 && (
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Top complaints</h3>
              <span className="text-[10px] text-zinc-600">→ Pain Points tab for full list</span>
            </div>
            <div>
              {topPainPoints.map((pp, i) => (
                <PainMini key={i} title={pp.title} severity={pp.severity} />
              ))}
            </div>
          </div>
        )}

        {/* Pricing snapshot */}
        {report.pricingModel && (
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Pricing</h3>
              <span className="rounded-full border border-white/[0.06] bg-zinc-800/60 px-2 py-0.5 text-[10px] text-zinc-500">
                {report.pricingModel}
              </span>
            </div>
            {topTiers.length === 0 ? (
              <p className="text-sm text-zinc-600">No tier data.</p>
            ) : (
              <div className="space-y-2">
                {topTiers.map((tier, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-zinc-800/40 px-3 py-2.5">
                    <span className="text-sm font-medium text-zinc-200">{tier.name}</span>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-zinc-200">{tier.price}</p>
                      <p className="text-[10px] text-zinc-600">{tier.period}</p>
                    </div>
                  </div>
                ))}
                {report.pricingTiers.length > 2 && (
                  <p className="text-[10px] text-zinc-600 pt-1">+{report.pricingTiers.length - 2} more tiers → Pricing tab</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI synthesis highlight */}
      {report.aiSynthesis && (report.aiSynthesis.doesWell || report.aiSynthesis.implication) && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {report.aiSynthesis.doesWell && (
            <div className="rounded-xl border border-white/[0.05] bg-zinc-800/40 p-4">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Does well</p>
              <p className="text-sm leading-relaxed text-zinc-300">{report.aiSynthesis.doesWell}</p>
            </div>
          )}
          {report.aiSynthesis.implication && (
            <div className="rounded-xl border border-[#2dd4bf]/15 bg-[#2dd4bf]/[0.03] p-4">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#2dd4bf]/60">Competitive implication</p>
              <p className="text-sm leading-relaxed text-zinc-300">{report.aiSynthesis.implication}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
