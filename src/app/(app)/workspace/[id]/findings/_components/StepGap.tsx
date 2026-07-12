"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { StepShell } from "./Step";
import type { SynthesisGap, SynthesisSignal } from "@/lib/analysis/workspaceSynthesis";

interface Props {
  featureGaps: SynthesisGap[];
  positiveSignals: SynthesisSignal[];
  gated: boolean;
  workspaceId: string;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function StepGap({ featureGaps, positiveSignals, gated, workspaceId }: Props) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const mainGap = featureGaps[0];
  const presents = positiveSignals.slice(0, 3);

  return (
    <StepShell>
      <div ref={ref} className="relative">
        {gated && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-sm bg-zinc-950/90 rounded-2xl">
            <p className="text-sm text-zinc-500 mb-4">Add 1 more app to unlock the gap.</p>
            <Link
              href={`/workspace/${workspaceId}`}
              className="text-sm font-medium text-zinc-200 border border-zinc-700 rounded-lg px-4 py-2 hover:bg-white/[0.04] transition-colors"
            >
              Add app
            </Link>
          </div>
        )}

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: EASE }}
          className="text-[10px] font-semibold tracking-[0.22em] text-zinc-600 uppercase mb-8"
        >
          The gap
        </motion.p>

        {/* Present (what everyone has) */}
        <div className="space-y-3 mb-8">
          {presents.map((sig, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, ease: EASE, delay: 0.1 + i * 0.08 }}
              className="flex items-center gap-3"
            >
              <span className="text-sm text-zinc-700 w-4 shrink-0 font-light">✓</span>
              <span className="text-sm text-zinc-500">{sig.title}</span>
            </motion.div>
          ))}
        </div>

        {/* The absent gap */}
        {mainGap && (
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, ease: EASE, delay: 0.38 }}
            className="flex items-start gap-3 border-t border-white/[0.06] pt-8"
          >
            <span className="text-lg text-white w-4 shrink-0 font-semibold mt-px">✗</span>
            <div>
              <p className="text-xl font-semibold text-white leading-snug mb-2">{mainGap.title}</p>
              <p className="text-sm text-zinc-500 leading-relaxed">{mainGap.opportunity}</p>
            </div>
          </motion.div>
        )}

        {!mainGap && !gated && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
            className="text-sm text-zinc-600"
          >
            Gaps will appear once synthesis runs.
          </motion.p>
        )}
      </div>
    </StepShell>
  );
}
