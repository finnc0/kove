"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import type { ReportPageData } from "./types";

function StarBar({ rating, count, max }: { rating: number; count: number; max: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  const reduced = useReducedMotion();
  return (
    <div className="flex items-center gap-2">
      <span className="w-3 shrink-0 text-right text-[10px] tabular-nums text-zinc-600">{rating}</span>
      <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-[#2dd4bf]"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={reduced ? { duration: 0 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className="w-6 shrink-0 text-[10px] tabular-nums text-zinc-600">{count}</span>
    </div>
  );
}

function ReviewCard({ title, body, author, rating, variant }: {
  title: string; body: string; author: string; rating: number; variant: "positive" | "negative";
}) {
  return (
    <div className={[
      "rounded-xl border p-4",
      variant === "positive"
        ? "border-[#2dd4bf]/10 bg-[#2dd4bf]/[0.02]"
        : "border-red-500/10 bg-red-500/[0.02]",
    ].join(" ")}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-zinc-200">{title}</p>
        <div className="flex shrink-0 items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={["text-[10px]", i < rating ? "text-amber-400" : "text-zinc-700"].join(" ")}>★</span>
          ))}
        </div>
      </div>
      <p className="text-xs leading-relaxed text-zinc-500 italic">&ldquo;{body}&rdquo;</p>
      <p className="mt-2 text-[10px] text-zinc-700">— {author}</p>
    </div>
  );
}

function approxStarDistribution(avgRating: number, totalRatings: number): number[] {
  // Approximate per-star counts from an average rating
  const avg = Math.max(1, Math.min(5, avgRating));
  const weights = [0, 0, 0, 0, 0];
  weights[4] = 0.3 + (avg - 1) * 0.15;
  weights[3] = 0.25 + (avg - 2.5) * 0.05;
  weights[2] = 0.15;
  weights[1] = 0.15 - (avg - 1) * 0.03;
  weights[0] = 1 - weights[1] - weights[2] - weights[3] - weights[4];
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => Math.round((w / sum) * totalRatings));
}

export function ReviewsTab({ data }: { data: ReportPageData }) {
  const { report, reviews, positiveCount, negativeCount } = data;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });

  if (!report) return null;

  const rating      = report.rating ?? 0;
  const reviewCount = report.reviewCount ?? 0;
  const starCounts  = approxStarDistribution(rating, reviewCount);
  const maxStar     = Math.max(...starCounts);

  const positiveReviews = reviews?.positive?.slice(0, 3) ?? [];
  const negativeReviews = reviews?.negative?.slice(0, 3) ?? [];
  const quotes          = report.communityQuotes ?? [];

  const total  = (positiveCount ?? 0) + (negativeCount ?? 0);
  const posPct = total > 0 && positiveCount != null
    ? Math.round((positiveCount / total) * 100)
    : Math.round(Math.max(10, Math.min(95, 10 + (rating - 1) * 20.5)));

  return (
    <div className="space-y-6">
      {/* Rating summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Star distribution */}
        <div ref={ref} className="rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
          <div className="mb-5 flex items-end gap-3">
            <span className="text-5xl font-bold tabular-nums text-white">{rating.toFixed(1)}</span>
            <div className="mb-1.5">
              <div className="flex items-center gap-0.5 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={["text-sm", i < Math.round(rating) ? "text-amber-400" : "text-zinc-700"].join(" ")}>★</span>
                ))}
              </div>
              <p className="text-xs text-zinc-500">{reviewCount.toLocaleString()} ratings</p>
            </div>
          </div>
          {inView && (
            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => (
                <StarBar key={star} rating={star} count={starCounts[star - 1]} max={maxStar} />
              ))}
            </div>
          )}
          <p className="mt-3 text-[10px] text-zinc-700 italic">Distribution approximated from average rating</p>
        </div>

        {/* Sentiment split */}
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">Sentiment split</h3>
          <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <motion.div
              className="h-full rounded-full bg-[#2dd4bf]"
              initial={{ width: 0 }}
              animate={{ width: `${posPct}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#2dd4bf]" />
              <span className="font-medium text-zinc-300">{posPct}% positive</span>
              {positiveCount != null && <span className="text-zinc-600">({positiveCount})</span>}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-zinc-700" />
              <span className="text-zinc-500">{100 - posPct}% negative</span>
              {negativeCount != null && <span className="text-zinc-600">({negativeCount})</span>}
            </div>
          </div>
          {total > 0 && (
            <p className="mt-3 text-[10px] text-zinc-700">Based on {total} analyzed reviews</p>
          )}
        </div>
      </div>

      {/* Review excerpts */}
      {(positiveReviews.length > 0 || negativeReviews.length > 0) && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {positiveReviews.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-white">Positive reviews</h3>
              <div className="space-y-3">
                {positiveReviews.map((r) => (
                  <ReviewCard key={r.id} title={r.title} body={r.body} author={r.author} rating={r.rating} variant="positive" />
                ))}
              </div>
            </div>
          )}
          {negativeReviews.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-white">Critical reviews</h3>
              <div className="space-y-3">
                {negativeReviews.map((r) => (
                  <ReviewCard key={r.id} title={r.title} body={r.body} author={r.author} rating={r.rating} variant="negative" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Community quotes */}
      {quotes.length > 0 && (
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">Community voices</h3>
          <div className="space-y-3">
            {quotes.map((q, i) => (
              <p key={i} className="border-l-2 border-zinc-700 pl-3 text-sm italic leading-relaxed text-zinc-400">&ldquo;{q}&rdquo;</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
