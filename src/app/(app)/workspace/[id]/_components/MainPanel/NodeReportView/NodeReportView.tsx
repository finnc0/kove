"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { ChevronDown, Loader2, Shuffle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NodeReport } from "../../../mockData";
import type { RawReview } from "@/lib/analysis/ios";

// ── Section label ──────────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold tracking-[0.2em] text-zinc-600 uppercase mb-5">
      {children}
    </p>
  );
}

// ── Thin divider between sections ─────────────────────────────────────────────
function Divider() {
  return <div className="border-b border-white/[0.04] my-10" />;
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toString();
}

// ── Severity config ────────────────────────────────────────────────────────────
const SEV: Record<string, { bar: string; text: string }> = {
  High:   { bar: "bg-zinc-300",  text: "text-zinc-400"  },
  Medium: { bar: "bg-zinc-500",  text: "text-zinc-500"  },
  Low:    { bar: "bg-zinc-700",  text: "text-zinc-600"  },
};

// ── Expandable row ─────────────────────────────────────────────────────────────
function ExpandRow({ title, badge, badgeCls, quote }: {
  title: string; badge?: string; badgeCls?: string; quote?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen(o => !o)} className="w-full text-left group">
      <div className="flex items-center gap-3 py-3.5 border-b border-white/[0.04] group-hover:border-white/[0.08] transition-colors duration-150">
        <span className="flex-1 text-[13px] text-zinc-200 leading-snug">{title}</span>
        {badge && <span className={cn("text-[10px] uppercase tracking-wider font-medium shrink-0", badgeCls)}>{badge}</span>}
        {quote && <ChevronDown className={cn("w-3 h-3 text-zinc-700 shrink-0 transition-transform duration-150", open && "rotate-180")} />}
      </div>
      {open && quote && (
        <p className="text-xs text-zinc-500 italic leading-relaxed px-0 py-3 border-b border-white/[0.04] bg-white/[0.01]">
          &ldquo;{quote}&rdquo;
        </p>
      )}
    </button>
  );
}

// ── Reviews modal ─────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-xs tabular-nums tracking-tight">
      {"★".repeat(rating)}
      <span className="text-zinc-800">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

type RatingFilter = 0 | 1 | 2 | 3 | 4 | 5;

function ReviewCard({ review }: { review: RawReview }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.body.length > 280;
  const body = isLong && !expanded ? review.body.slice(0, 280) + "…" : review.body;
  const date = review.date
    ? new Date(review.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";
  return (
    <div className="py-4 border-b border-white/[0.04] last:border-0">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <Stars rating={review.rating} />
          {review.title && (
            <span className="text-xs font-medium text-zinc-300 truncate max-w-[200px]">{review.title}</span>
          )}
        </div>
        <span className="text-xs text-zinc-700 shrink-0">{date}</span>
      </div>
      <p className="text-xs text-zinc-500 leading-relaxed">
        {body}
        {isLong && (
          <button onClick={() => setExpanded(e => !e)} className="ml-1.5 text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer">
            {expanded ? "less" : "more"}
          </button>
        )}
      </p>
      {review.author && <p className="text-xs text-zinc-700 mt-1.5">{review.author}</p>}
    </div>
  );
}

function ReviewsModalContent({ workspaceId, nodeId }: { workspaceId: string; nodeId: string }) {
  const [allReviews, setAllReviews] = useState<RawReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RatingFilter>(0);
  const [page, setPage] = useState(1);
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    fetch(`/api/workspaces/${workspaceId}/nodes/${nodeId}/reviews`)
      .then(r => r.ok ? r.json() : { reviews: [] })
      .then(d => setAllReviews(d.reviews ?? []))
      .catch(() => setAllReviews([]))
      .finally(() => setLoading(false));
  }, [workspaceId, nodeId]);

  const displayed = useMemo(() => {
    let list = [...allReviews];
    let s = seed + 1;
    for (let i = list.length - 1; i > 0; i--) {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      const j = Math.abs(s) % (i + 1);
      [list[i], list[j]] = [list[j], list[i]];
    }
    if (filter !== 0) list = list.filter(r => r.rating === filter);
    return list;
  }, [allReviews, filter, seed]);

  const visible = displayed.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < displayed.length;
  const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of allReviews) ratingCounts[r.rating] = (ratingCounts[r.rating] ?? 0) + 1;

  if (loading) return (
    <div className="flex items-center justify-center gap-2 text-zinc-600 py-16">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm">Loading reviews…</span>
    </div>
  );

  if (!allReviews.length) return (
    <div className="py-16 text-center">
      <p className="text-sm text-zinc-700">No reviews stored for this app.</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06] shrink-0">
        <div className="flex gap-1">
          {([0, 5, 4, 3, 2, 1] as RatingFilter[]).map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={cn(
                "text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer tabular-nums",
                filter === f ? "bg-white/[0.08] text-white" : "text-zinc-600 hover:text-zinc-300"
              )}
            >
              {f === 0 ? "All" : `${f}★`}
              {f !== 0 && ratingCounts[f] ? (
                <span className={cn("ml-1", filter === f ? "text-zinc-500" : "text-zinc-700")}>{ratingCounts[f]}</span>
              ) : null}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setSeed(s => s + 1); setPage(1); }}
          className="ml-auto flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer"
        >
          <Shuffle className="w-3 h-3" />
          Shuffle
        </button>
        <span className="text-xs text-zinc-700 ml-2">
          {displayed.length.toLocaleString()}{filter !== 0 ? ` of ${allReviews.length}` : ""}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 mt-1 scrollbar-dark">
        {visible.map(r => <ReviewCard key={r.id} review={r} />)}
        {hasMore && (
          <button
            onClick={() => setPage(p => p + 1)}
            className="w-full py-3 text-xs text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
          >
            Load {Math.min(PAGE_SIZE, displayed.length - visible.length)} more
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main report ────────────────────────────────────────────────────────────────
interface Props {
  report: NodeReport;
  workspaceId: string;
  nodeId: string;
  iconUrl?: string | null;
  reviewsOpen: boolean;
  onReviewsOpenChange: (open: boolean) => void;
}

export function NodeReportView({ report, workspaceId, nodeId, reviewsOpen, onReviewsOpenChange }: Props) {
  if (!report?.appName) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-zinc-700">
        No report available yet.
      </div>
    );
  }

  return (
    <div className="space-y-0">

      {/* ── Overview ────────────────────────────────────────────────────────── */}
      <section>
        <Label>Overview</Label>
        <p className="text-xs text-zinc-700 mb-4">{report.lastUpdated}</p>
        <p className="text-sm text-zinc-400 leading-[1.8] max-w-xl">{report.description}</p>
      </section>

      <Divider />

      {/* ── Market Data ─────────────────────────────────────────────────────── */}
      {report.estimate && (report.estimate.downloads !== null || report.estimate.revenue !== null) && (
        <>
          <section>
            <div className="flex items-center justify-between mb-6">
              <Label>Market Data</Label>
              {report.estimate.scrapedAt && (
                <span className="text-[10px] text-zinc-700">
                  as of {new Date(report.estimate.scrapedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] text-zinc-700 uppercase tracking-widest mb-2">Monthly Downloads</p>
                <p className="text-3xl font-light text-white tracking-tight">
                  {report.estimate.downloads !== null ? fmtNum(report.estimate.downloads) : "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-700 uppercase tracking-widest mb-2">Monthly Revenue (iOS)</p>
                <p className="text-3xl font-light text-white tracking-tight">
                  {report.estimate.revenue !== null ? `$${fmtNum(report.estimate.revenue)}` : "—"}
                </p>
              </div>
            </div>
          </section>
          <Divider />
        </>
      )}

      {/* ── Financials ──────────────────────────────────────────────────────── */}
      <section>
        <Label>Financials</Label>
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-5">{report.pricingModel}</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {report.pricingTiers.map((tier, i) => (
            <div
              key={`${tier.name}-${i}`}
              className={cn(
                "rounded-xl p-4 border",
                tier.isPopular ? "border-white/[0.12] bg-white/[0.03]" : "border-white/[0.05] bg-white/[0.01]"
              )}
            >
              {tier.isPopular && <p className="text-[10px] text-zinc-600 mb-2 uppercase tracking-widest">Popular</p>}
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest">{tier.name}</p>
              <p className="text-2xl font-light text-white mt-1">{tier.price}</p>
              <p className="text-[10px] text-zinc-700 mb-3">{tier.period}</p>
              <ul className="space-y-1.5">
                {tier.features.map((f, fi) => (
                  <li key={fi} className="text-xs text-zinc-600 flex items-start gap-1.5">
                    <span className="text-zinc-700 shrink-0 mt-0.5">·</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── Traffic ─────────────────────────────────────────────────────────── */}
      <section>
        <Label>Traffic</Label>
        <div className="flex gap-10">
          <div>
            <p className="text-[10px] text-zinc-700 uppercase tracking-widest mb-1.5">Top Country</p>
            <p className="text-sm text-zinc-300">{report.topCountry}</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-700 uppercase tracking-widest mb-1.5">Primary Source</p>
            <p className="text-sm text-zinc-300">{report.trafficSource}</p>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── Positive Signals ────────────────────────────────────────────────── */}
      <section>
        <Label>Positive Signals</Label>
        <div>
          {report.positiveSignals.map((sig, i) => (
            <div key={i} className="py-3.5 border-b border-white/[0.04] last:border-0">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[13px] font-medium text-zinc-200">{sig.theme}</p>
                <span className="text-[10px] text-zinc-700">{sig.frequency}</span>
              </div>
              <p className="text-xs text-zinc-600 italic leading-relaxed border-l border-white/[0.08] pl-3">
                &ldquo;{sig.quote}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── Pain Points ─────────────────────────────────────────────────────── */}
      <section>
        <Label>Pain Points</Label>
        <div>
          {report.painPoints.map((pp, i) => (
            <ExpandRow
              key={i}
              title={pp.title}
              badge={pp.severity}
              badgeCls={SEV[pp.severity]?.text ?? "text-zinc-600"}
              quote={pp.quote}
            />
          ))}
        </div>
      </section>

      <Divider />

      {/* ── Community ───────────────────────────────────────────────────────── */}
      <section>
        <Label>Community Sentiment</Label>
        <p className="text-sm text-zinc-400 leading-[1.8] max-w-xl mb-6">{report.communitySummary}</p>
        <div className="space-y-4">
          {report.communityQuotes.map((q, i) => (
            <p key={i} className="text-xs text-zinc-600 italic leading-relaxed border-l border-white/[0.08] pl-3">
              &ldquo;{q}&rdquo;
            </p>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── AI Synthesis ────────────────────────────────────────────────────── */}
      <section>
        <Label>AI Synthesis</Label>
        <div className="space-y-8">
          {[
            { num: "01", heading: "What it does well",            body: report.aiSynthesis.doesWell    },
            { num: "02", heading: "Where it structurally fails",  body: report.aiSynthesis.fails       },
            { num: "03", heading: "What this means for you",      body: report.aiSynthesis.implication },
          ].map(s => (
            <div key={s.num} className="flex items-start gap-6">
              <span className="text-[32px] leading-none font-light text-zinc-800 tabular-nums w-10 shrink-0 -mt-1">{s.num}</span>
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-600 uppercase mb-2">{s.heading}</p>
                <p className="text-sm text-zinc-400 leading-[1.8]">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer margin ───────────────────────────────────────────────────── */}
      <div className="pb-20 pt-10 flex items-center gap-4">
        <div className="flex-1 h-px bg-white/[0.04]" />
        <span className="text-[10px] font-mono text-zinc-800">end of report</span>
        <div className="flex-1 h-px bg-white/[0.04]" />
      </div>

      {/* ── Reviews modal ───────────────────────────────────────────────────── */}
      <Dialog.Root open={reviewsOpen} onOpenChange={onReviewsOpenChange}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 duration-150" />
          <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl h-[78vh] flex flex-col bg-zinc-950 border border-white/[0.08] rounded-2xl shadow-2xl outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 duration-150">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.06] shrink-0">
              <div>
                <Dialog.Title className="text-sm font-semibold text-white">Reviews</Dialog.Title>
                <p className="text-xs text-zinc-600 mt-0.5">{report.appName}</p>
              </div>
              <Dialog.Close className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer outline-none">
                <X className="w-4 h-4" />
              </Dialog.Close>
            </div>
            <div className="flex-1 min-h-0 px-6 py-4">
              <ReviewsModalContent workspaceId={workspaceId} nodeId={nodeId} />
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
}
