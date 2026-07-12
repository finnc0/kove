"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StepNiche } from "./StepNiche";
import { StepScale } from "./StepScale";
import { StepPain } from "./StepPain";
import { StepPricing } from "./StepPricing";
import { StepGap } from "./StepGap";
import { StepOpportunity } from "./StepOpportunity";
import { ProgressDots } from "./ProgressDots";
import type { WorkspaceSynthesis } from "@/lib/analysis/workspaceSynthesis";

export interface FindingsPricingRow {
  app: string;
  appIcon?: string | null;
  model: string;
  entryPrice: string;
  topPrice: string;
  entryPriceNum?: number;
  rating: number;
  reviewCount: number;
}

export interface FindingsScrollProps {
  workspaceName: string;
  workspaceId: string;
  analyzedCount: number;
  synthesis: WorkspaceSynthesis | null;
  pricing: FindingsPricingRow[];
  totals: { downloads: number; revenue: number };
}

const STEP_LABELS = ["Market", "Scale", "Pain", "Pricing", "Gap", "Verdict"];

// Must match the (app) TopNav height
const TOP_NAV_PX = 56;
const SECTION_H = `calc(100vh - ${TOP_NAV_PX}px)`;

const containerStyle: React.CSSProperties = {
  position: "fixed",
  top: TOP_NAV_PX,
  left: 0,
  right: 0,
  bottom: 0,
  overflowY: "scroll",
  scrollSnapType: "y mandatory",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
} as React.CSSProperties;

const sectionStyle: React.CSSProperties = {
  height: SECTION_H,
  scrollSnapAlign: "start",
  scrollSnapStop: "always",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
};

export function FindingsScroll({
  workspaceName,
  workspaceId,
  analyzedCount,
  synthesis,
  pricing,
  totals,
}: FindingsScrollProps) {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>(new Array(6).fill(null));

  const setRef = (i: number) => (el: HTMLDivElement | null) => {
    sectionRefs.current[i] = el;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observers: IntersectionObserver[] = [];
    sectionRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveStep(i); },
        { root: container, rootMargin: "-38% 0px -38% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  const scrollToStep = (i: number) => {
    sectionRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const gated = analyzedCount < 3;

  return (
    <>
      {/* Suppress webkit scrollbar only on this container */}
      <style>{`#findings-snap-container::-webkit-scrollbar { display: none; }`}</style>

      {/* Back link — floats above the container */}
      <Link
        href={`/workspace/${workspaceId}`}
        className="fixed z-30 flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
        style={{ top: TOP_NAV_PX + 14, left: 32 }}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {workspaceName}
      </Link>

      {/* Progress dots */}
      <ProgressDots
        count={6}
        active={activeStep}
        labels={STEP_LABELS}
        onDotClick={scrollToStep}
      />

      {/* Snap scroll container */}
      <div id="findings-snap-container" ref={containerRef} className="bg-zinc-950" style={containerStyle}>

        <div ref={setRef(0)} style={sectionStyle}>
          <StepNiche workspaceName={workspaceName} analyzedCount={analyzedCount} />
        </div>

        <div ref={setRef(1)} style={sectionStyle}>
          <StepScale totals={totals} appCount={analyzedCount} />
        </div>

        <div ref={setRef(2)} style={sectionStyle}>
          <StepPain painPoints={synthesis?.painPoints ?? []} />
        </div>

        <div ref={setRef(3)} style={sectionStyle}>
          <StepPricing pricing={pricing} />
        </div>

        <div ref={setRef(4)} style={sectionStyle}>
          <StepGap
            featureGaps={synthesis?.featureGaps ?? []}
            positiveSignals={synthesis?.positiveSignals ?? []}
            gated={gated}
            workspaceId={workspaceId}
          />
        </div>

        <div ref={setRef(5)} style={sectionStyle}>
          <StepOpportunity
            marketEntry={synthesis?.marketEntry ?? null}
            gated={gated}
            workspaceId={workspaceId}
          />
        </div>

        {/* Footer — last snap section */}
        <div
          style={{ ...sectionStyle, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px w-16 bg-white/[0.06]" />
            <span className="text-[10px] font-mono text-zinc-700 tracking-widest">end of report</span>
            <div className="h-px w-16 bg-white/[0.06]" />
          </div>
          <p className="text-sm text-zinc-600 mb-5">Add more apps to sharpen this.</p>
          <Link
            href={`/workspace/${workspaceId}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-300 border border-white/[0.1] rounded-lg px-5 py-2.5 hover:bg-white/[0.04] hover:border-white/[0.15] transition-colors"
          >
            Back to workspace
          </Link>
        </div>
      </div>
    </>
  );
}
