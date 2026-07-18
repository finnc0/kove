"use client";

import { EstimateBreakdown } from "../EstimateBreakdown";
import { EstTag } from "../EstTag";
import type { ReportPageData } from "./types";

function Row({ label, value, est }: { label: string; value: string | null; est?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 first:pt-0 last:pb-0 border-b border-white/[0.04] last:border-0">
      <p className="text-xs text-zinc-600">{label}</p>
      <div className="flex items-center gap-1.5 text-right">
        <p className="text-xs font-medium text-zinc-300">{value}</p>
        {est && <EstTag />}
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(new Date(iso));
  } catch { return iso; }
}

function appAgeMonths(releaseDate: string) {
  try {
    const months = Math.round((Date.now() - new Date(releaseDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    if (months < 2) return "< 1 month";
    if (months < 24) return `${months} months`;
    return `${Math.round(months / 12)} years`;
  } catch { return "—"; }
}

function ChartBadge({ rank, label }: { rank: number | null; label: string }) {
  if (rank === null) return null;
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-white/[0.05] bg-zinc-800/40 px-4 py-3">
      <span className="text-xl font-bold tabular-nums text-white">#{rank}</span>
      <span className="text-center text-[10px] text-zinc-600">{label}</span>
    </div>
  );
}

export function MarketDataTab({ data }: { data: ReportPageData }) {
  const { report, facts, estimate } = data;

  const charts = facts?.charts;
  const hasAnyChart = charts && (
    charts.topFreeRank !== null ||
    charts.topGrossingRank !== null ||
    charts.categoryFreeRank !== null ||
    charts.categoryGrossingRank !== null
  );

  return (
    <div className="space-y-6">
      {/* Estimate (Pro-gated) */}
      <EstimateBreakdown estimate={estimate ?? { downloads: null, revenue: null, scrapedAt: null }} />

      {/* Growth & traffic */}
      {report && (report.monthlyDownloads || report.momGrowth || report.topCountry || report.trafficSource) && (
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">Growth &amp; traffic</h3>
          <div className="divide-y divide-white/[0.04]">
            {report.monthlyDownloads && (
              <Row label="Monthly downloads" value={report.monthlyDownloads} est />
            )}
            {report.momGrowth && (
              <div className="flex items-start justify-between gap-4 py-2.5 first:pt-0 last:pb-0 border-b border-white/[0.04] last:border-0">
                <p className="text-xs text-zinc-600">MoM growth</p>
                <p className={["text-xs font-medium tabular-nums", report.growthDir === "up" ? "text-[#2dd4bf]" : "text-red-400"].join(" ")}>
                  {report.growthDir === "up" ? "▲" : "▼"} {report.momGrowth}
                </p>
              </div>
            )}
            <Row label="Top country" value={report.topCountry} />
            <Row label="Primary traffic source" value={report.trafficSource} />
          </div>
        </div>
      )}

      {/* Chart positions */}
      {hasAnyChart && (
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Chart positions</h3>
            <span className="text-[10px] text-zinc-700">from Apple · exact</span>
          </div>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <ChartBadge rank={charts.topFreeRank}       label="Top Free Overall" />
            <ChartBadge rank={charts.topGrossingRank}   label="Top Grossing Overall" />
            <ChartBadge rank={charts.categoryFreeRank}  label={`Free in ${facts?.category ?? "category"}`} />
            <ChartBadge rank={charts.categoryGrossingRank} label={`Grossing in ${facts?.category ?? "category"}`} />
          </div>
          {!charts.topFreeRank && !charts.topGrossingRank &&
           !charts.categoryFreeRank && !charts.categoryGrossingRank && (
            <p className="text-xs text-zinc-600">Not in any top-200 chart at time of analysis.</p>
          )}
        </div>
      )}

      {/* Facts from Apple */}
      {facts && (
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">The facts</h3>
            <span className="text-[10px] text-zinc-700">from Apple · exact</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            <Row label="Released"     value={formatDate(facts.releaseDate)} />
            <Row label="Last updated" value={`${formatDate(facts.lastUpdated)} · v${facts.version}`} />
            <Row label="Age"          value={appAgeMonths(facts.releaseDate)} />
            <Row label="Languages"    value={facts.languageCount > 0 ? String(facts.languageCount) : null} />
            <Row label="Total ratings" value={facts.totalRatings?.toLocaleString() ?? null} />
          </div>
        </div>
      )}
    </div>
  );
}
