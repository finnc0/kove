import { StatCard } from "./StatCard";

interface Props {
  totalDownloads: number;
  totalRevenue: number;
  competitorCount: number;
  painPointCount: number;
  hasEnoughData: boolean;
}

export function StatRow({
  totalDownloads,
  totalRevenue,
  competitorCount,
  painPointCount,
  hasEnoughData,
}: Props) {
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
        value={hasEnoughData ? painPointCount : 0}
        label="Shared pain points"
        placeholder={
          competitorCount === 0
            ? "Add apps"
            : `Add ${Math.max(0, 3 - competitorCount)} more`
        }
      />
    </div>
  );
}
