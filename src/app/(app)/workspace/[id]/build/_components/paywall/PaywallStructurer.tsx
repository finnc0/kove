"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Plus, Info } from "lucide-react";
import type { PSFeature, PSTier } from "./types";
import { PSMatrix } from "./PSMatrix";
import { AddTierModal } from "./AddTierModal";

const EASE = [0.22, 1, 0.36, 1] as const;

interface Props {
  workspaceId: string;
  workspaceName: string;
  initialTiers: PSTier[];
  features: PSFeature[];
}

export function PaywallStructurer({ workspaceId, workspaceName, initialTiers, features }: Props) {
  const reduced = useReducedMotion();
  const [tiers, setTiers] = useState<PSTier[]>(initialTiers);
  const [addOpen, setAddOpen] = useState(false);

  // Gate line is drawn after the first "free" tier (name contains "free", case-insensitive)
  // or after index 0 if there's >1 tier and no explicit free tier
  const gateAfterIndex: number | null = (() => {
    if (tiers.length < 2) return null;
    const freeIdx = tiers.findIndex((t) => t.name.toLowerCase().includes("free"));
    return freeIdx !== -1 ? freeIdx : 0;
  })();

  const patchTier = useCallback(async (tierId: string, patch: { name?: string; prices?: Record<string, string> }) => {
    setTiers((prev) => prev.map((t) =>
      t.id === tierId
        ? { ...t, ...(patch.name ? { name: patch.name } : {}), ...(patch.prices ? { prices: patch.prices } : {}) }
        : t,
    ));
    await fetch(`/api/workspaces/${workspaceId}/build/tiers/${tierId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  }, [workspaceId]);

  const deleteTier = useCallback(async (tierId: string) => {
    setTiers((prev) => prev.filter((t) => t.id !== tierId));
    await fetch(`/api/workspaces/${workspaceId}/build/tiers/${tierId}`, { method: "DELETE" });
  }, [workspaceId]);

  const toggleFeature = useCallback(async (tierId: string, featureId: string, included: boolean) => {
    setTiers((prev) => prev.map((t) =>
      t.id === tierId
        ? {
            ...t,
            featureIds: included
              ? [...t.featureIds, featureId]
              : t.featureIds.filter((id) => id !== featureId),
          }
        : t,
    ));
    await fetch(`/api/workspaces/${workspaceId}/build/tiers/${tierId}/features`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featureId, included }),
    });
  }, [workspaceId]);

  const addTier = useCallback((tier: PSTier) => {
    setTiers((prev) => [...prev, tier]);
  }, []);

  return (
    <div
      className="min-h-screen bg-zinc-950"
      style={{
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1.5px, transparent 1.5px)",
        backgroundSize: "32px 32px",
      }}
    >
      {/* Top bar */}
      <div className="sticky top-0 z-20 border-b border-white/[0.06] bg-zinc-950/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/workspace/${workspaceId}/build`}
              className="flex items-center gap-1.5 text-xs text-zinc-600 transition-colors hover:text-zinc-400 shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Build Zone
            </Link>
            <span className="text-zinc-700">/</span>
            <span className="text-sm font-semibold text-white truncate">Paywall Structurer</span>
            <span className="rounded-full border border-white/[0.06] bg-zinc-800/60 px-2 py-0.5 text-[10px] text-zinc-500">
              {tiers.length} tier{tiers.length !== 1 ? "s" : ""}
            </span>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#2dd4bf] px-3 py-1.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-[#5eead4] shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            Add tier
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Hint */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="mb-6 flex items-start gap-2 rounded-lg border border-white/[0.04] bg-zinc-900/40 px-4 py-3"
        >
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600" />
          <p className="text-xs leading-relaxed text-zinc-600">
            Click a cell to include or exclude a feature from a tier. Click a tier name to rename it.
            Set the monthly price per tier. The teal gate line marks where the paywall begins.
          </p>
        </motion.div>

        {/* Matrix */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05, ease: EASE }}
          className="rounded-xl border border-white/[0.06] bg-zinc-900/30 p-6"
        >
          <PSMatrix
            workspaceId={workspaceId}
            features={features}
            tiers={tiers}
            onTierPatch={patchTier}
            onTierDelete={deleteTier}
            onToggle={toggleFeature}
            gateAfterTierIndex={gateAfterIndex}
          />
        </motion.div>
      </div>

      {addOpen && (
        <AddTierModal
          workspaceId={workspaceId}
          onAdd={addTier}
          onClose={() => setAddOpen(false)}
        />
      )}
    </div>
  );
}
