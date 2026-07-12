interface ChartPosition {
  topFreeRank: number | null;
  topPaidRank: number | null;
  topGrossingRank: number | null;
  categoryFreeRank: number | null;
  categoryGrossingRank: number | null;
}

function FactRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
      <p className="text-xs text-zinc-600">{label}</p>
      <p className="text-right text-xs font-medium text-zinc-300">{value}</p>
    </div>
  );
}

function bestChart(charts: ChartPosition, category: string): string | null {
  const candidates = [
    charts.topFreeRank !== null
      ? `#${charts.topFreeRank} Top Free Overall`
      : null,
    charts.topGrossingRank !== null
      ? `#${charts.topGrossingRank} Top Grossing Overall`
      : null,
    charts.categoryFreeRank !== null
      ? `#${charts.categoryFreeRank} in ${category}`
      : null,
    charts.categoryGrossingRank !== null
      ? `#${charts.categoryGrossingRank} Grossing in ${category}`
      : null,
  ].filter(Boolean) as string[];
  return candidates.length > 0 ? candidates.join(" · ") : "Not in top 200";
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function appAgeMonths(releaseDate: string): string {
  try {
    const diff = Date.now() - new Date(releaseDate).getTime();
    const months = Math.round(diff / (1000 * 60 * 60 * 24 * 30.44));
    if (months < 2) return "< 1 month";
    if (months < 24) return `${months} months`;
    return `${Math.round(months / 12)} years`;
  } catch {
    return "—";
  }
}

export interface AppFactsData {
  releaseDate: string;
  lastUpdated: string;
  version: string;
  languageCount: number;
  charts: ChartPosition;
  totalRatings: number;
  category: string;
}

export function AppFacts({ facts }: { facts: AppFactsData }) {
  const chartStr = bestChart(facts.charts, facts.category);

  return (
    <div className="mb-5 rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">The facts</h3>
        <span className="text-[10px] text-zinc-700">from Apple · exact</span>
      </div>

      <div className="divide-y divide-white/[0.04]">
        <FactRow label="Released" value={formatDate(facts.releaseDate)} />
        <FactRow label="Last updated" value={`${formatDate(facts.lastUpdated)} · v${facts.version}`} />
        <FactRow label="Age" value={appAgeMonths(facts.releaseDate)} />
        <FactRow
          label="Languages"
          value={facts.languageCount > 0 ? `${facts.languageCount}` : null}
        />
        <FactRow label="Chart position" value={chartStr} />
        <FactRow
          label="Total ratings"
          value={facts.totalRatings.toLocaleString()}
        />
      </div>
    </div>
  );
}
