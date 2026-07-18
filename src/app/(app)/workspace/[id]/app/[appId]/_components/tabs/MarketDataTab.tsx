import type { ReportPageData } from "./types";

export function MarketDataTab({ data }: { data: ReportPageData }) {
  // Phase 3: estimate (gated), monthlyDownloads, momGrowth, growthDir,
  //          topCountry, trafficSource, chart positions, release/update facts
  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-600">Market Data — coming in Phase 3</p>
    </div>
  );
}
