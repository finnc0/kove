import { StatCard } from "./StatCard";

interface Props {
  totalDownloads: number;
  totalRevenue: number;
  competitorCount: number;
  avgRating: number;
}

export function StatRow({ totalDownloads, totalRevenue, competitorCount, avgRating }: Props) {
  return (
    <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        value={totalDownloads}
        label="Downloads / mo"
        prefix="~"
        estimate
        placeholder="Add apps"
      />
      <StatCard
        value={totalRevenue}
        label="Revenue / mo"
        prefix="~$"
        estimate
        placeholder="Add apps"
      />
      <StatCard
        value={competitorCount}
        label="Competitors"
        placeholder="None yet"
      />
      <StatCard
        value={avgRating ? Math.round(avgRating * 10) / 10 : 0}
        label="Avg rating"
        placeholder="Add apps"
        decimals={1}
        suffix=" ★"
      />
    </div>
  );
}
