"use client";

import { Lock } from "lucide-react";
import type { AppEstimate } from "@/lib/estimation/types";
import { useBilling } from "@/hooks/useBilling";
import { PaywallModal } from "@/components/paywall/PaywallModal";
import { useState } from "react";

interface Props {
  estimate: AppEstimate;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "recently";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function EstimateBreakdown({ estimate }: Props) {
  const [paywallOpen, setPaywallOpen] = useState(false);
  const billing = useBilling();

  if (!billing.loading && !billing.isPro) {
    return (
      <>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2dd4bf]/50">
            Market data
          </p>
          <p className="mb-4 text-sm leading-relaxed text-zinc-600">
            Live download and revenue figures for this app.
          </p>
          <button
            onClick={() => setPaywallOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-zinc-800/60 px-3.5 py-2 text-xs font-medium text-zinc-400 transition-colors hover:border-[#2dd4bf]/20 hover:text-white"
          >
            <Lock className="h-3 w-3 text-[#2dd4bf]/60" />
            Unlock refined estimates
          </button>
        </div>
        <PaywallModal
          open={paywallOpen}
          onClose={() => setPaywallOpen(false)}
          gate="refined_estimate"
        />
      </>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold text-white">Market data</h3>
        {estimate.scrapedAt && (
          <span className="text-[10px] text-zinc-600">
            as of {fmtDate(estimate.scrapedAt)}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600 mb-1">Downloads / mo</p>
          <p className="text-2xl font-bold tabular-nums text-white">
            {estimate.downloads !== null ? fmtNum(estimate.downloads) : "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600 mb-1">Revenue / mo</p>
          <p className="text-2xl font-bold tabular-nums text-white">
            {estimate.revenue !== null ? `$${fmtNum(estimate.revenue)}` : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toString();
}
