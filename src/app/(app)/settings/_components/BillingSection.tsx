"use client";

import { useState } from "react";
import { ExternalLink, Sparkles } from "lucide-react";
import { useBilling } from "@/hooks/useBilling";
import { PaywallModal } from "@/components/paywall/PaywallModal";

export function BillingSection() {
  const billing = useBilling();
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  async function openPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      if (!res.ok) {
        const text = await res.text();
        console.error("Portal error:", res.status, text);
        return;
      }
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setPortalLoading(false);
    }
  }

  if (billing.loading) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-zinc-900 p-6">
        <div className="h-4 w-24 animate-pulse rounded bg-white/[0.06]" />
      </div>
    );
  }

  const periodEnd = billing.currentPeriodEnd
    ? new Date(billing.currentPeriodEnd).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const trialEnd = billing.trialEndsAt
    ? new Date(billing.trialEndsAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <>
      <div className="rounded-2xl border border-white/[0.06] bg-zinc-900 p-6">
        <h3 className="mb-4 text-sm font-semibold text-white">Plan &amp; Billing</h3>

        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-white">
                {billing.isPro ? "Kove Pro" : "Explorer (Free)"}
              </p>
              {billing.isPro && (
                <span className="flex items-center gap-1 rounded-full bg-[#2dd4bf]/15 px-2 py-0.5 text-[10px] font-semibold text-[#2dd4bf]">
                  <Sparkles className="h-2.5 w-2.5" />
                  Pro
                </span>
              )}
            </div>

            {billing.status === "trialing" && trialEnd && (
              <p className="mt-1 text-xs text-zinc-400">Trial ends {trialEnd}</p>
            )}
            {billing.status === "past_due" && (
              <p className="mt-1 text-xs text-zinc-400">Payment issue — update your card</p>
            )}
            {billing.isPro && billing.cancelAtPeriodEnd && periodEnd && (
              <p className="mt-1 text-xs text-zinc-500">Cancels {periodEnd}</p>
            )}
            {billing.isPro && !billing.cancelAtPeriodEnd && periodEnd && (
              <p className="mt-1 text-xs text-zinc-500">Renews {periodEnd}</p>
            )}
          </div>

          {billing.isPro ? (
            <button
              onClick={openPortal}
              disabled={portalLoading}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-white/[0.15] hover:text-white disabled:opacity-50"
            >
              <ExternalLink className="h-3 w-3" />
              {portalLoading ? "Opening…" : "Manage billing"}
            </button>
          ) : (
            <button
              onClick={() => setPaywallOpen(true)}
              className="rounded-lg bg-[#2dd4bf] px-3 py-1.5 text-xs font-semibold text-zinc-950 transition-opacity hover:opacity-90"
            >
              Upgrade to Pro
            </button>
          )}
        </div>

        {!billing.isPro && (
          <p className="text-xs text-zinc-600">
            Free plan: 1 workspace · 3 competitors · basic findings.
          </p>
        )}

        {billing.status === "past_due" && (
          <button
            onClick={openPortal}
            disabled={portalLoading}
            className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-800/60 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-700"
          >
            Update payment method →
          </button>
        )}
      </div>

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        gate="competitor_limit"
        hasUsedTrial={billing.hasUsedTrial}
      />
    </>
  );
}
