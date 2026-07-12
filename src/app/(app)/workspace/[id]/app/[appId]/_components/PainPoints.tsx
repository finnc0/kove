"use client";

import { useState } from "react";
import { SignalRow } from "./SignalRow";

interface PainPoint {
  title: string;
  severity: "High" | "Medium" | "Low";
  reviewCount?: number;
  quote: string;
}

export function PainPoints({ items }: { items: PainPoint[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? items : items.slice(0, 6);
  const hasMore = items.length > 6;

  if (!items.length) return null;

  return (
    <div className="mb-5 rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
      <h3 className="mb-4 text-sm font-semibold text-white">
        What users complain about
      </h3>
      <div className="divide-y divide-white/[0.04]">
        {visible.map((pp, i) => (
          <SignalRow
            key={i}
            title={pp.title}
            severity={pp.severity}
            quote={pp.quote}
            reviewCount={pp.reviewCount}
            variant="pain"
          />
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-xs text-zinc-600 transition-colors hover:text-zinc-400"
        >
          {showAll
            ? "Show less"
            : `Show ${items.length - 6} more`}
        </button>
      )}
    </div>
  );
}
