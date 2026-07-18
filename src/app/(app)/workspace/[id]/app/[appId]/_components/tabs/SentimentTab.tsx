"use client";

import { SentimentCard } from "../SentimentCard";
import type { ReportPageData } from "./types";

export function SentimentTab({ data }: { data: ReportPageData }) {
  const { report, positiveCount, negativeCount } = data;
  if (!report) return null;

  const positiveSignals = report.positiveSignals ?? [];

  return (
    <div className="space-y-6">
      {/* Sentiment bar */}
      <SentimentCard
        rating={report.rating}
        reviewCount={report.reviewCount}
        positiveCount={positiveCount}
        negativeCount={negativeCount}
      />

      {/* What users love — positive themes */}
      {positiveSignals.length > 0 && (
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">What users love</h3>
          <div className="divide-y divide-white/[0.04]">
            {positiveSignals.map((s, i) => (
              <div key={i} className="flex flex-col gap-2 py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#2dd4bf]/60" />
                  <p className="text-sm font-medium text-white">{s.theme}</p>
                  {s.frequency && (
                    <span className="ml-auto shrink-0 text-[10px] text-zinc-600">{s.frequency}</span>
                  )}
                </div>
                {s.quote && (
                  <p className="pl-4 text-sm italic leading-relaxed text-zinc-500">&ldquo;{s.quote}&rdquo;</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Community summary */}
      {report.communitySummary && (
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
          <h3 className="mb-3 text-sm font-semibold text-white">Community summary</h3>
          <p className="text-sm leading-relaxed text-zinc-400">{report.communitySummary}</p>
        </div>
      )}

      {/* AI synthesis — full three blocks */}
      {report.aiSynthesis && (
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">Analysis</h3>
          <div className="space-y-3">
            {report.aiSynthesis.doesWell && (
              <div className="rounded-xl border border-white/[0.05] bg-zinc-800/40 p-4">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Does well</p>
                <p className="text-sm leading-relaxed text-zinc-300">{report.aiSynthesis.doesWell}</p>
              </div>
            )}
            {report.aiSynthesis.fails && (
              <div className="rounded-xl border border-white/[0.05] bg-zinc-800/40 p-4">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Structural failures</p>
                <p className="text-sm leading-relaxed text-zinc-300">{report.aiSynthesis.fails}</p>
              </div>
            )}
            {report.aiSynthesis.implication && (
              <div className="rounded-xl border border-[#2dd4bf]/15 bg-[#2dd4bf]/[0.03] p-4">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#2dd4bf]/60">Competitive implication</p>
                <p className="text-sm leading-relaxed text-zinc-300">{report.aiSynthesis.implication}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
