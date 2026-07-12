"use client";

import type { WorkspaceSynthesis } from "@/lib/analysis/workspaceSynthesis";
import type { FindingsPricingRow } from "@/app/api/workspaces/[id]/findings/route";

interface Props {
  synthesis: WorkspaceSynthesis;
  pricing?: FindingsPricingRow[];
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold tracking-[0.2em] text-zinc-600 uppercase mb-5">
      {children}
    </p>
  );
}

function Divider() {
  return <div className="border-t border-white/[0.05] my-10" />;
}

export function WorkspaceSynthesisView({ synthesis, pricing = [] }: Props) {
  return (
    <div className="max-w-xl mx-auto px-8 py-9">

      {/* ── Market Overview ──────────────────────────────────────────────────── */}
      <section>
        <SectionLabel>Market Overview</SectionLabel>
        <p className="text-sm text-zinc-300 leading-[1.85]">
          {synthesis.nicheOverview}
        </p>
      </section>

      {/* ── Pain Points ─────────────────────────────────────────────────────── */}
      {synthesis.painPoints?.length > 0 && (
        <>
          <Divider />
          <section>
            <SectionLabel>Pain Points</SectionLabel>
            <div>
              {synthesis.painPoints.map((pp, i) => (
                <div key={i} className="flex items-start gap-4 py-3.5 border-b border-white/[0.05] last:border-0">
                  <span className="text-[10px] font-mono text-zinc-700 w-5 shrink-0 mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-200 leading-snug mb-1">{pp.title}</p>
                    <p className="text-xs text-zinc-500 leading-relaxed">{pp.description}</p>
                  </div>
                  <span className="text-[10px] text-zinc-700 shrink-0 mt-0.5">{pp.severity}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ── What Works ──────────────────────────────────────────────────────── */}
      {synthesis.positiveSignals?.length > 0 && (
        <>
          <Divider />
          <section>
            <SectionLabel>What Works</SectionLabel>
            <div className="space-y-4">
              {synthesis.positiveSignals.map((sig, i) => (
                <div key={i}>
                  <p className="text-sm text-zinc-200 mb-1">{sig.title}</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">{sig.description}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ── Opportunities ───────────────────────────────────────────────────── */}
      {synthesis.featureGaps?.length > 0 && (
        <>
          <Divider />
          <section>
            <SectionLabel>Opportunities</SectionLabel>
            <div>
              {synthesis.featureGaps.map((gap, i) => (
                <div key={i} className="flex items-start gap-4 py-4 border-b border-white/[0.05] last:border-0">
                  <span className="text-[10px] font-mono text-zinc-700 w-5 shrink-0 mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-200 leading-snug mb-1">{gap.title}</p>
                    <p className="text-xs text-zinc-500 leading-relaxed">{gap.opportunity}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ── Entry Playbook ──────────────────────────────────────────────────── */}
      {synthesis.marketEntry && (
        <>
          <Divider />
          <section>
            <SectionLabel>Entry Playbook</SectionLabel>

            {/* Wedge */}
            <p className="text-sm text-zinc-300 leading-relaxed border-l border-white/[0.1] pl-4 mb-8">
              {synthesis.marketEntry.wedge}
            </p>

            {/* Target + Edge */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-[10px] text-zinc-700 uppercase tracking-[0.18em] mb-2">Target</p>
                <p className="text-xs text-zinc-400 leading-relaxed">{synthesis.marketEntry.icp}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-700 uppercase tracking-[0.18em] mb-2">Edge</p>
                <p className="text-xs text-zinc-400 leading-relaxed">{synthesis.marketEntry.differentiator}</p>
              </div>
            </div>

            {/* Build / Avoid */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] text-zinc-700 uppercase tracking-[0.18em] mb-3">Build first</p>
                <ul className="space-y-2.5">
                  {synthesis.marketEntry.featureBets?.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-[10px] font-mono text-zinc-700 shrink-0 mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-xs text-zinc-400 leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] text-zinc-700 uppercase tracking-[0.18em] mb-3">Avoid</p>
                <ul className="space-y-2.5">
                  {synthesis.marketEntry.pitfalls?.map((p, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-[10px] font-mono text-zinc-700 shrink-0 mt-0.5">—</span>
                      <span className="text-xs text-zinc-500 leading-relaxed">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── Pricing Landscape ───────────────────────────────────────────────── */}
      {pricing.length > 0 && (
        <>
          <Divider />
          <section>
            <SectionLabel>Pricing Landscape</SectionLabel>

            {/* Column headers */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-6 pb-3 border-b border-white/[0.06] mb-1">
              <p className="text-[10px] text-zinc-700 uppercase tracking-[0.18em]">App</p>
              <p className="text-[10px] text-zinc-700 uppercase tracking-[0.18em]">Model</p>
              <p className="text-[10px] text-zinc-700 uppercase tracking-[0.18em] text-right">Price</p>
            </div>

            {pricing.map((entry, i) => {
              const initial = entry.app.trim().charAt(0).toUpperCase();
              const hasRange = entry.topPrice && entry.topPrice !== entry.entryPrice;
              return (
                <div key={i} className="grid grid-cols-[1fr_auto_auto] gap-x-6 items-center py-3.5 border-b border-white/[0.04] last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    {entry.appIcon ? (
                      <img src={entry.appIcon} alt="" className="w-6 h-6 rounded-md object-cover shrink-0" />
                    ) : (
                      <span className="w-6 h-6 rounded-md bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-[10px] font-medium text-zinc-500 shrink-0">
                        {initial}
                      </span>
                    )}
                    <p className="text-sm text-zinc-200 truncate">{entry.app}</p>
                  </div>
                  <span className="text-[10px] text-zinc-500 border border-white/[0.07] rounded-full px-2.5 py-1 whitespace-nowrap">
                    {entry.model}
                  </span>
                  <div className="text-right tabular-nums whitespace-nowrap">
                    <span className="text-sm text-zinc-300">{entry.entryPrice}</span>
                    {hasRange && (
                      <span className="text-[10px] text-zinc-600 ml-1.5">→ {entry.topPrice}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        </>
      )}

      {/* ── Footer margin ───────────────────────────────────────────────────── */}
      <div className="pt-16 pb-10 flex items-center gap-4">
        <div className="flex-1 h-px bg-white/[0.04]" />
        <span className="text-[10px] font-mono text-zinc-800">end of report</span>
        <div className="flex-1 h-px bg-white/[0.04]" />
      </div>

    </div>
  );
}
