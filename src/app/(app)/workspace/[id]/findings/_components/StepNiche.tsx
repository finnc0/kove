"use client";

import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { StepShell } from "./Step";
import { useCountUp } from "./hooks";

interface Props {
  workspaceName: string;
  analyzedCount: number;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function StepNiche({ workspaceName, analyzedCount }: Props) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { value, start } = useCountUp(analyzedCount);

  useEffect(() => { if (isInView) start(); }, [isInView, start]);

  return (
    <StepShell>
      <div ref={ref}>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: EASE }}
          className="text-[10px] font-semibold tracking-[0.22em] text-zinc-600 uppercase mb-8"
        >
          Market
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: EASE, delay: 0.08 }}
          className="text-5xl font-semibold text-white leading-tight mb-6"
        >
          {workspaceName}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: EASE, delay: 0.18 }}
          className="text-sm text-zinc-500"
        >
          {value} app{value !== 1 ? "s" : ""} analyzed
        </motion.p>
      </div>
    </StepShell>
  );
}
