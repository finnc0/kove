"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { PlanSummaryStrip } from "./PlanSummaryStrip";
import { ToolCard } from "./ToolCard";
import { ResearchBridge } from "./ResearchBridge";
import { MarketSignalsGuard } from "../shared/MarketSignalsGuard";
import type { SynthesisGap, SynthesisPainPoint } from "@/lib/analysis/workspaceSynthesis";

const EASE = [0.22, 1, 0.36, 1] as const;

interface Plan {
  id: string;
  name: string;
  idea: string | null;
  ideaSourceGap: string | null;
  targetUser: string | null;
  coreValue: string | null;
  monetization: string | null;
  platform: string | null;
  designDirection: string | null;
  features: { id: string; category: string }[];
  paywallRules: { id: string }[];
  tiers: { id: string }[];
  onboardingScreens: { id: string }[];
}

interface Props {
  workspaceId: string;
  workspaceName: string;
  competitorCount: number;
  plan: Plan;
  gaps: SynthesisGap[];
  painPoints: SynthesisPainPoint[];
}

export function BuildZoneHome({ workspaceId, workspaceName, competitorCount, plan, gaps, painPoints }: Props) {
  const reduced = useReducedMotion();

  const coreCount = plan.features.filter((f) => f.category === "core").length;
  const totalCount = plan.features.length;
  const screenCount = plan.onboardingScreens.length;
  const tierCount = plan.tiers.length;

  const fade = (delay = 0) => ({
    initial: reduced ? {} : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.38, delay, ease: EASE },
  });

  return (
    <div
      className="min-h-screen bg-zinc-950"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.025) 1.5px, transparent 1.5px)",
        backgroundSize: "32px 32px",
      }}
    >
      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Header */}
        <motion.div {...fade(0)} className="mb-8">
          <div className="mb-1 flex items-center gap-2 text-xs text-zinc-600">
            <Link
              href={`/workspace/${workspaceId}`}
              className="transition-colors hover:text-zinc-400"
            >
              ← {workspaceName}
            </Link>
            <span>/</span>
            <span className="text-zinc-500">Build Zone</span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold text-white">{plan.name}</h1>
              {plan.idea && (
                <p className="mt-1 text-sm leading-relaxed text-zinc-400 max-w-xl">
                  {plan.idea}
                </p>
              )}
              {plan.ideaSourceGap && (
                <p className="mt-2 text-xs text-zinc-600">
                  <span className="text-[#2dd4bf]/70">from research: </span>
                  {plan.ideaSourceGap}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Plan summary strip */}
        <motion.div {...fade(0.06)} className="mb-8">
          <PlanSummaryStrip
            workspaceId={workspaceId}
            plan={{
              targetUser: plan.targetUser,
              coreValue: plan.coreValue,
              monetization: plan.monetization,
              platform: plan.platform,
              designDirection: plan.designDirection,
            }}
          />
        </motion.div>

        {/* Divider */}
        <div className="mb-8 h-px bg-white/[0.04]" />

        {/* Tool cards */}
        <motion.div {...fade(0.12)} className="mb-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
            Planning tools
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <ToolCard
              href={`/workspace/${workspaceId}/build/features`}
              title="Feature Organizer"
              description="Plan, categorize, and prioritize your features."
              stat={totalCount > 0 ? `${totalCount} feature${totalCount !== 1 ? "s" : ""}` : null}
              statLabel={coreCount > 0 ? `· ${coreCount} core` : undefined}
            />
            <ToolCard
              href={`/workspace/${workspaceId}/build/onboarding-flow`}
              title="Onboarding Flow"
              description="Map the first-time experience screen by screen."
              stat={screenCount > 0 ? `${screenCount} screen${screenCount !== 1 ? "s" : ""}` : null}
            />
            <ToolCard
              href={`/workspace/${workspaceId}/build/paywall`}
              title="Paywall Structurer"
              description="Define tiers and decide what's gated."
              stat={tierCount > 0 ? `${tierCount} tier${tierCount !== 1 ? "s" : ""}` : null}
            />
          </div>
        </motion.div>

        {/* Research bridge (guarded) */}
        <motion.div {...fade(0.18)}>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
            Market signals
          </h2>
          <MarketSignalsGuard workspaceId={workspaceId} competitorCount={competitorCount}>
            <ResearchBridge
              workspaceId={workspaceId}
              buildPlanId={plan.id}
              gaps={gaps}
              painPoints={painPoints}
            />
          </MarketSignalsGuard>
        </motion.div>
      </div>
    </div>
  );
}
