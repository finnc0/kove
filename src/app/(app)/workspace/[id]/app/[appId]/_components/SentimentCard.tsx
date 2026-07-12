"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

function approxPositivePct(rating: number): number {
  // Linear map: 1★ → 10%, 5★ → 92%
  return Math.round(Math.max(10, Math.min(95, 10 + (rating - 1) * 20.5)));
}

export function SentimentCard({
  rating,
  reviewCount,
  positiveCount,
  negativeCount,
}: {
  rating: number;
  reviewCount: number;
  positiveCount?: number;
  negativeCount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  const reduced = useReducedMotion();

  // Use actual counts if both present, otherwise approximate from rating
  const total = (positiveCount ?? 0) + (negativeCount ?? 0);
  const positivePct =
    total > 0 && positiveCount !== undefined
      ? Math.round((positiveCount / total) * 100)
      : approxPositivePct(rating);
  const negativePct = 100 - positivePct;

  const analyzed = total > 0 ? total : null;

  return (
    <div ref={ref} className="mb-5 rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
      <h3 className="mb-4 text-sm font-semibold text-white">Sentiment</h3>

      {/* Bar */}
      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
        <motion.div
          className="h-full rounded-full bg-[#2dd4bf]"
          initial={{ width: 0 }}
          animate={inView ? { width: `${positivePct}%` } : { width: 0 }}
          transition={
            reduced ? { duration: 0 } : { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
          }
        />
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#2dd4bf]" />
          <span className="font-medium text-zinc-300">{positivePct}% positive</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-zinc-700" />
          <span className="text-zinc-500">{negativePct}% negative</span>
        </div>
      </div>

      {/* Meta */}
      <p className="mt-3 text-[10px] text-zinc-700">
        {analyzed
          ? `Based on ${analyzed} analyzed reviews`
          : `Approximated from ${reviewCount.toLocaleString()} total ratings`}
        {!analyzed && (
          <span className="ml-1 italic">· actual distribution may vary</span>
        )}
      </p>
    </div>
  );
}
