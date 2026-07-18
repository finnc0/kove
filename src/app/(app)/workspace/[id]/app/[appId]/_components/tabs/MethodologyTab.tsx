import type { ReportPageData } from "./types";

const SOURCES = [
  "App Store metadata (title, description, category, developer)",
  "App Store ratings & reviews (scraped sample)",
  "App Store chart positions (top free, paid, grossing)",
  "In-app purchase catalog",
  "Developer website & pricing page (via Jina AI reader)",
  "AI synthesis via Claude (pattern extraction from reviews)",
];

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function MethodologyTab({ data }: { data: ReportPageData }) {
  const { estimateRefined, analyzedAt, estimate } = data;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Estimate type */}
      <div className="rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Estimate type</h3>
          <span className={[
            "rounded-full border px-2 py-0.5 text-[10px] font-medium",
            estimateRefined
              ? "border-[#2dd4bf]/20 bg-[#2dd4bf]/[0.06] text-[#2dd4bf]"
              : "border-zinc-700 bg-zinc-800/60 text-zinc-500",
          ].join(" ")}>
            {estimateRefined ? "refined" : "preliminary"}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-zinc-400">
          {estimateRefined
            ? "Refined estimates are based on current App Store scraper data — download and revenue figures are derived from live rating velocity, chart position, and category benchmarks."
            : "Preliminary estimates are calculated from rating velocity and market benchmarks at time of first analysis. Accuracy improves once refined estimates are generated (typically within 48 hours)."}
        </p>
        {estimate?.scrapedAt && (
          <p className="mt-3 text-[10px] text-zinc-600">
            Estimate data as of: {new Date(estimate.scrapedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        )}
      </div>

      {/* Facts vs estimates */}
      <div className="rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
        <h3 className="mb-4 text-sm font-semibold text-white">Facts vs estimates</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-lg border border-white/[0.04] bg-zinc-800/30 px-4 py-3">
            <span className="mt-0.5 shrink-0 rounded-full bg-zinc-700/50 px-2 py-0.5 text-[10px] font-medium text-zinc-400">Fact</span>
            <p className="text-xs text-zinc-400">Sourced directly from Apple: rating, review count, release date, last updated, version, languages, chart positions, IAP catalog. These are exact and never estimated.</p>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-[#2dd4bf]/10 bg-[#2dd4bf]/[0.02] px-4 py-3">
            <span className="mt-0.5 shrink-0 rounded-full bg-[#2dd4bf]/10 px-2 py-0.5 text-[10px] font-medium text-[#2dd4bf]/70">est.</span>
            <p className="text-xs text-zinc-400">Derived from signals: downloads/mo, revenue/mo, and growth metrics are estimates. They carry uncertainty and should be treated as directional, not precise.</p>
          </div>
        </div>
      </div>

      {/* Data sources */}
      <div className="rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
        <h3 className="mb-4 text-sm font-semibold text-white">Data sources</h3>
        <ul className="space-y-2">
          {SOURCES.map((s, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-500">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
              {s}
            </li>
          ))}
        </ul>
      </div>

      {/* Analyzed at */}
      {analyzedAt && (
        <p className="text-[10px] text-zinc-700">
          Analysis completed: {formatDate(analyzedAt)}
        </p>
      )}

      {/* Disclaimer */}
      <p className="text-[10px] leading-relaxed text-zinc-700 italic">
        All estimates are provided for informational and competitive research purposes. Figures may not reflect actual app performance. Kove is not affiliated with Apple, Google, or any analyzed app publisher.
      </p>
    </div>
  );
}
