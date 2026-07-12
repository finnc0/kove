"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { StepShell } from "./Step";
import type { SynthesisPainPoint } from "@/lib/analysis/workspaceSynthesis";

interface Props {
  painPoints: SynthesisPainPoint[];
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const SEV_FILLED: Record<string, number> = { Critical: 5, High: 4, Medium: 3 };

function SignalDots({ filled, isVisible, baseDelay }: { filled: number; isVisible: boolean; baseDelay: number }) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={isVisible ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.22, ease: EASE, delay: baseDelay + i * 0.07 }}
          className={`block w-2 h-2 rounded-full ${i < filled ? "bg-white" : "bg-white/[0.1]"}`}
        />
      ))}
    </div>
  );
}

export function StepPain({ painPoints }: Props) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const top3 = painPoints.slice(0, 3);

  return (
    <StepShell>
      <div ref={ref}>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: EASE }}
          className="text-[10px] font-semibold tracking-[0.22em] text-zinc-600 uppercase mb-10"
        >
          Everyone complains about
        </motion.p>

        {top3.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.1 }}
            className="text-sm text-zinc-600"
          >
            No pain points extracted yet.
          </motion.p>
        ) : (
          <div className="space-y-10">
            {top3.map((pp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, ease: EASE, delay: 0.1 + i * 0.12 }}
                className="flex items-start gap-6"
              >
                <SignalDots
                  filled={SEV_FILLED[pp.severity] ?? 3}
                  isVisible={isInView}
                  baseDelay={0.24 + i * 0.12}
                />
                <div>
                  <p className="text-lg font-medium text-zinc-100 leading-snug">{pp.title}</p>
                  <p className="text-sm text-zinc-500 mt-1 leading-relaxed">{pp.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </StepShell>
  );
}
