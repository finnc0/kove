"use client";

import { useRef, useState } from "react";
import { Lock } from "lucide-react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { StepShell } from "./Step";
import { useBilling } from "@/hooks/useBilling";
import { PaywallModal } from "@/components/paywall/PaywallModal";
import type { WorkspaceSynthesis } from "@/lib/analysis/workspaceSynthesis";

interface Props {
  marketEntry: WorkspaceSynthesis["marketEntry"] | null;
  gated: boolean;
  workspaceId: string;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function StepOpportunity({ marketEntry, gated, workspaceId }: Props) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const billing = useBilling();
  const [paywallOpen, setPaywallOpen] = useState(false);

  const cards = marketEntry
    ? [
        { label: "Positioning", value: marketEntry.differentiator },
        { label: "Who for", value: marketEntry.icp },
        { label: "Build first", value: marketEntry.featureBets?.[0] ?? "" },
      ]
    : [];

  const billingLocked = !billing.loading && !billing.isPro;

  if (billingLocked) {
    return (
      <StepShell>
        <div className="rounded-3xl border border-white/[0.06] bg-zinc-900 p-7">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2dd4bf]/50">
            Market opportunity
          </p>
          <p className="mb-5 text-sm leading-relaxed text-zinc-600">
            Your opening wedge, target customer, and first feature bet — synthesised from all the competitor data you&apos;ve collected.
          </p>
          <button
            onClick={() => setPaywallOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-zinc-800/60 px-3.5 py-2 text-xs font-medium text-zinc-400 transition-colors hover:border-[#2dd4bf]/20 hover:text-white"
          >
            <Lock className="h-3 w-3 text-[#2dd4bf]/60" />
            See the market opportunity
          </button>
        </div>
        <PaywallModal
          open={paywallOpen}
          onClose={() => setPaywallOpen(false)}
          gate="market_opportunity"
          hasUsedTrial={billing.hasUsedTrial}
        />
      </StepShell>
    );
  }

  return (
    <StepShell>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-zinc-900 p-7"
      >
        {gated && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl bg-zinc-900/80 backdrop-blur-md">
            <p className="mb-4 text-sm text-zinc-400">Add 1 more app to unlock the verdict.</p>
            <Link
              href={`/workspace/${workspaceId}`}
              className="rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Add app
            </Link>
          </div>
        )}

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
          className="mb-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500"
        >
          Your opening
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: EASE, delay: 0.18 }}
          className="mb-8 text-xl font-semibold leading-snug text-white"
        >
          {marketEntry ? marketEntry.wedge : "Generating verdict…"}
        </motion.p>

        <div className="space-y-3">
          {cards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 14 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, ease: EASE, delay: 0.32 + i * 0.08 }}
              className="flex items-start gap-4 rounded-xl bg-white/[0.05] px-5 py-4"
            >
              <p className="mt-0.5 w-20 shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                {card.label}
              </p>
              <p className="text-sm leading-relaxed text-zinc-200">{card.value}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </StepShell>
  );
}
