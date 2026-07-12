"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { PlanToggle } from "./PlanToggle";
import type { GateKey } from "@/lib/entitlements";

const EASE = [0.22, 1, 0.36, 1] as const;

// ─── Gate copy ────────────────────────────────────────────────────────────────

const GATE_META: Record<GateKey, { eyebrow: string; headline: string; sub: string }> = {
  competitor_limit: {
    eyebrow: "Competitor analysis",
    headline: "Add unlimited competitors to confirm the pattern",
    sub: "You've found something — add more to make sure it's real, not noise.",
  },
  workspace_limit: {
    eyebrow: "Workspace limit",
    headline: "Research every market you're considering",
    sub: "Create unlimited workspaces and switch between markets in seconds.",
  },
  market_opportunity: {
    eyebrow: "Market opportunity",
    headline: "See the gap and exactly how to position against it",
    sub: "The synthesis is ready — it names the wedge, the ICP, and what to build first.",
  },
  refined_estimate: {
    eyebrow: "Refined estimates",
    headline: "Unlock refined, higher-confidence estimates",
    sub: "Tighter ranges, deeper methodology, confidence levels for every number.",
  },
  idea_evaluation: {
    eyebrow: "Idea evaluation",
    headline: "Test your idea against the real market",
    sub: "See which gaps it fills, which pains it solves, and where it overlaps competitors.",
  },
  export: {
    eyebrow: "Export & share",
    headline: "Export your research and share it",
    sub: "Download as Markdown or PDF, or share a live link with your team.",
  },
};

// ─── Visual value glimpse per gate ───────────────────────────────────────────

function CompetitorGlimpse() {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-[#2dd4bf]" />
      <p className="text-xs leading-relaxed text-zinc-400">
        3 competitors already share this complaint — the 4th will confirm whether it&apos;s a real signal or coincidence.
      </p>
    </div>
  );
}

function MarketOpportunityGlimpse() {
  return (
    <div className="pointer-events-none select-none space-y-2" style={{ filter: "blur(2.5px)", opacity: 0.55 }}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2dd4bf]/70">The gap</p>
      <div className="h-3.5 w-4/5 rounded bg-white/[0.12]" />
      <div className="h-2.5 w-full rounded bg-white/[0.07]" />
      <div className="h-2.5 w-3/4 rounded bg-white/[0.05]" />
      <div className="mt-3 flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-[#2dd4bf]" />
        <div className="h-2 w-32 rounded bg-white/[0.06]" />
      </div>
    </div>
  );
}

function RefinedEstimateGlimpse() {
  return (
    <div className="pointer-events-none select-none space-y-2.5" style={{ filter: "blur(2.5px)", opacity: 0.55 }}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">Downloads / mo</span>
        <span className="text-sm font-semibold tabular-nums text-white">24K – 48K</span>
      </div>
      <div className="h-px bg-white/[0.05]" />
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">Revenue / mo</span>
        <span className="text-sm font-semibold tabular-nums text-white">$18K – $35K</span>
      </div>
      <div className="h-px bg-white/[0.05]" />
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">Confidence</span>
        <span className="text-xs font-medium text-[#2dd4bf]">High</span>
      </div>
    </div>
  );
}

function ExportGlimpse() {
  return (
    <div className="pointer-events-none select-none space-y-1.5 font-mono" style={{ filter: "blur(2.5px)", opacity: 0.55 }}>
      <p className="text-[11px] text-zinc-400"># Competitor Intelligence Report</p>
      <div className="h-2 w-3/4 rounded bg-white/[0.07]" />
      <div className="h-2 w-full rounded bg-white/[0.05]" />
      <div className="h-2 w-5/6 rounded bg-white/[0.05]" />
      <div className="h-2 w-2/3 rounded bg-white/[0.04]" />
    </div>
  );
}

function IdeaGlimpse() {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-[#2dd4bf]" />
      <p className="text-xs leading-relaxed text-zinc-400">
        Write the idea free. Pro maps it against your market data — gaps filled, pains solved, competitor overlaps.
      </p>
    </div>
  );
}

function WorkspaceGlimpse() {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-[#2dd4bf]" />
      <p className="text-xs leading-relaxed text-zinc-400">
        Most founders research 2–3 markets in parallel before committing — one workspace makes that impossible.
      </p>
    </div>
  );
}

const GLIMPSE: Record<GateKey, React.ReactNode> = {
  competitor_limit: <CompetitorGlimpse />,
  workspace_limit: <WorkspaceGlimpse />,
  market_opportunity: <MarketOpportunityGlimpse />,
  refined_estimate: <RefinedEstimateGlimpse />,
  idea_evaluation: <IdeaGlimpse />,
  export: <ExportGlimpse />,
};

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  gate: GateKey;
  hasUsedTrial?: boolean;
}

export function PaywallModal({ open, onClose, gate }: Props) {
  const [plan, setPlan] = useState<"monthly" | "annual">("annual");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => { setMounted(true); }, []);

  const meta = GATE_META[gate];

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("[checkout]", res.status, text);
        return;
      }
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  const price = plan === "annual" ? "$19/mo" : "$29/mo";
  const priceSub = plan === "annual" ? "billed $228/yr · save 35%" : "billed monthly";

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[9998] bg-zinc-950/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            onClick={onClose}
          />

          {/* Modal — fixed to viewport, above canvas transforms */}
          <div className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              className="pointer-events-auto relative w-full max-w-[440px] overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900 shadow-2xl shadow-black/60"
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
              transition={{ duration: reduced ? 0 : 0.25, ease: EASE }}
            >
              <div className="p-6">
                {/* Close */}
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-600 transition-colors hover:text-zinc-400"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Eyebrow + headline */}
                <div className="mb-5 pr-8">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2dd4bf]/60">
                    {meta.eyebrow}
                  </p>
                  <h2 className="text-[17px] font-semibold leading-snug text-white">
                    {meta.headline}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{meta.sub}</p>
                </div>

                {/* Value glimpse */}
                <div className="mb-5 overflow-hidden rounded-xl border border-white/[0.05] bg-zinc-950/60 px-4 py-3.5">
                  {GLIMPSE[gate]}
                </div>

                {/* Plan toggle + price */}
                <div className="mb-5 flex items-center justify-between gap-4">
                  <PlanToggle value={plan} onChange={setPlan} />
                  <div className="text-right">
                    <p className="text-lg font-semibold tabular-nums text-white">{price}</p>
                    <p className="text-[11px] text-zinc-600">{priceSub}</p>
                  </div>
                </div>

                {/* Primary CTA */}
                <div className="space-y-2">
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full rounded-xl bg-[#2dd4bf] py-2.5 text-sm font-semibold text-zinc-950 transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {loading ? "Redirecting…" : "Upgrade to Pro"}
                  </button>
                  <p className="text-center text-xs text-zinc-600">Secure checkout · cancel anytime</p>
                </div>

                {/* Ghost dismiss */}
                <button
                  onClick={onClose}
                  className="mt-3 w-full py-1 text-xs text-zinc-600 transition-colors hover:text-zinc-400"
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
