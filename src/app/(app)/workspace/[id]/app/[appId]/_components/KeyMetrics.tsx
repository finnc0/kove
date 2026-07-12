import { MetricCard } from "./MetricCard";
import type { AppEstimate } from "@/lib/estimation/types";

function ratingRange(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M ratings`;
  if (count >= 1_000) return `${Math.round(count / 1_000)}K ratings`;
  return `${count} ratings`;
}

function fmtMoney(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toString();
}

interface Props {
  estimate: AppEstimate | null;
  rating: number | null;
  reviewCount: number | null;
}

export function KeyMetrics({ estimate, rating, reviewCount }: Props) {
  const downloads = estimate?.downloads ?? null;
  const revenue = estimate?.revenue ?? null;

  return (
    <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-3">
      {/* Downloads */}
      <MetricCard
        label="Monthly downloads"
        value={downloads ?? 0}
        isEstimate={downloads === null}
        range={downloads !== null ? undefined : "No data"}
      />

      {/* Revenue */}
      <MetricCard
        label="Monthly revenue"
        value={revenue ?? 0}
        prefix="$"
        isEstimate={revenue === null}
        range={revenue !== null ? `$${fmtMoney(revenue)}/mo` : "No data"}
      />

      {/* Rating */}
      <MetricCard
        label="App Store rating"
        value={rating ? Math.round(rating * 10) : 0}
        secondary={reviewCount ? ratingRange(reviewCount) : undefined}
      />
    </div>
  );
}
