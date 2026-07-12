import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Competitor } from "./mockData";

function RatingBar({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5 flex-1 max-w-[80px]">
        {[1,2,3,4,5].map(i => (
          <div key={i} className={`h-0.5 flex-1 rounded-full ${i <= Math.round(rating) ? "bg-white/25" : "bg-white/[0.08]"}`} />
        ))}
      </div>
      <span className="text-xs text-zinc-500 tabular-nums">{rating.toFixed(1)}</span>
    </div>
  );
}

export function CompetitorMap({ competitors }: { competitors: Competitor[] }) {
  const sorted = [...competitors].sort((a, b) => b.rating - a.rating);

  return (
    <section id="competitor-map" className="mb-14">
      <p className="text-xs font-medium text-zinc-700 uppercase tracking-widest mb-1">02</p>
      <h2 className="text-base font-semibold text-white mb-6">Competitor Map</h2>

      {/* Comparison table */}
      <div className="rounded-xl border border-white/[0.06] overflow-hidden mb-3">
        {/* Header */}
        <div className="grid grid-cols-[1fr_120px_80px_100px] gap-4 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
          <span className="text-xs font-medium text-zinc-700">App</span>
          <span className="text-xs font-medium text-zinc-700">Rating</span>
          <span className="text-xs font-medium text-zinc-700 text-right">Reviews</span>
          <span className="text-xs font-medium text-zinc-700">Pricing</span>
        </div>

        {/* Rows */}
        {sorted.map((c, i) => (
          <div key={c.name} className={i < sorted.length - 1 ? "border-b border-white/[0.04]" : ""}>
            {/* Main row */}
            <div className="grid grid-cols-[1fr_120px_80px_100px] gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white">{c.name}</p>
                  <div className="flex gap-1">
                    {c.platforms.map((p) => (
                      <Badge key={p} variant="outline" className="text-xs py-0 px-1.5 text-zinc-700 border-white/[0.05] bg-transparent">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-zinc-600 mt-0.5 truncate">{c.description}</p>
              </div>
              <div className="flex items-center">
                <RatingBar rating={c.rating} />
              </div>
              <div className="flex items-center justify-end">
                <span className="text-xs text-zinc-600 tabular-nums">
                  {c.reviews >= 1000 ? `${(c.reviews / 1000).toFixed(0)}K` : c.reviews}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-zinc-500">{c.pricing}</span>
              </div>
            </div>

            {/* Strengths / weaknesses strip */}
            <div className="px-5 pb-3 flex flex-wrap gap-1.5">
              {c.strengths.map((s) => (
                <span key={s} className="text-xs bg-white/[0.05] text-zinc-400 border border-white/[0.06] rounded-lg px-2 py-0.5">{s}</span>
              ))}
              {c.weaknesses.map((w) => (
                <span key={w} className="text-xs text-zinc-600 border border-white/[0.04] rounded-lg px-2 py-0.5">{w}</span>
              ))}
              <a
                href={`https://${c.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1 text-xs text-zinc-700 hover:text-zinc-300 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3 h-3" />{c.url}
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
