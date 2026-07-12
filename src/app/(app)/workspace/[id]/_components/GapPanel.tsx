"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";
import { PaywallModal } from "@/components/paywall/PaywallModal";

interface Props {
  workspaceId: string;
  gap: { title: string; opportunity: string } | null;
  workspaceStatus: "empty" | "building" | "ready";
  completedCount: number;
  isProUser?: boolean;
  hasUsedTrial?: boolean;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export function GapPanel({
  workspaceId,
  gap,
  workspaceStatus,
  completedCount,
  isProUser = false,
  hasUsedTrial = false,
}: Props) {
  const [paywallOpen, setPaywallOpen] = useState(false);
  const needed = Math.max(0, 3 - completedCount);
  const isReady = workspaceStatus === "ready" && gap !== null;
  const isBuilding = workspaceStatus === "building" || completedCount >= 3;

  if (isReady && gap) {
    if (!isProUser) {
      return (
        <>
          <div className="rounded-xl border border-white/[0.05] bg-zinc-900/40 p-5">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2dd4bf]/50">
              Market opportunity
            </p>
            <p className="mb-4 text-sm leading-relaxed text-zinc-600">
              The gap synthesis is ready — see where competitors fall short and how to position against them.
            </p>
            <button
              onClick={() => setPaywallOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-zinc-800/60 px-3.5 py-2 text-xs font-medium text-zinc-400 transition-colors hover:border-[#2dd4bf]/20 hover:text-white"
            >
              <Lock className="h-3 w-3 text-[#2dd4bf]/60" />
              See the market gap
            </button>
          </div>
          <PaywallModal
            open={paywallOpen}
            onClose={() => setPaywallOpen(false)}
            gate="market_opportunity"
            hasUsedTrial={hasUsedTrial}
          />
        </>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="relative overflow-hidden rounded-xl border border-[#2dd4bf]/25 bg-[#2dd4bf]/[0.04] p-5"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(45,212,191,0.1) 0%, transparent 70%)",
          }}
        />
        <p className="relative mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2dd4bf]/70">
          The gap
        </p>
        <p className="relative mb-3 text-base font-semibold leading-snug text-white">
          {gap.title}
        </p>
        <p className="relative mb-4 text-sm leading-relaxed text-zinc-400">
          {gap.opportunity}
        </p>
        <div className="relative flex items-center gap-2">
          <motion.span className="relative flex h-2 w-2">
            <motion.span
              className="absolute inline-flex h-full w-full rounded-full bg-[#2dd4bf]"
              animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
            <span className="relative h-2 w-2 rounded-full bg-[#2dd4bf]" />
          </motion.span>
          <span className="text-xs text-[#2dd4bf]/60">
            Confirmed across {completedCount} apps
          </span>
        </div>
      </motion.div>
    );
  }

  if (completedCount > 0 && (isBuilding || completedCount >= 3)) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-zinc-900/50 p-5">
        <div className="flex h-2 w-2 animate-pulse items-center justify-center rounded-full bg-[#2dd4bf]" />
        <p className="text-sm text-zinc-500">
          Findings appear once analysis completes.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/[0.05] bg-zinc-900/40 p-5">
      <Lock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-700" />
      <div>
        <p className="text-sm text-zinc-500">
          Add {needed} more competitor{needed === 1 ? "" : "s"} to reveal the
          gap.
        </p>
      </div>
    </div>
  );
}
