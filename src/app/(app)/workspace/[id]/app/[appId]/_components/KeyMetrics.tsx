import { MetricCard } from "./MetricCard";

function ratingRange(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M ratings`;
  if (count >= 1_000) return `${Math.round(count / 1_000)}K ratings`;
  return `${count} ratings`;
}

interface Props {
  rating: number | null;
  reviewCount: number | null;
}

export function KeyMetrics({ rating, reviewCount }: Props) {
  return (
    <MetricCard
      label="App Store rating"
      value={rating ? Math.round(rating * 10) : 0}
      secondary={reviewCount ? ratingRange(reviewCount) : undefined}
      ratingMode
    />
  );
}
