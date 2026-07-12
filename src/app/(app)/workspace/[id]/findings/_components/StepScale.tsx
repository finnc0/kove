"use client";

import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { StepShell } from "./Step";
import { useCountUp } from "./hooks";

interface Props {
  totals: { downloads: number; revenue: number };
  appCount: number;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n > 0 ? String(n) : "—";
}

function fmtMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return n > 0 ? `$${n}` : "—";
}

interface StatProps {
  raw: number;
  label: string;
  format: (n: number) => string;
  delay: number;
}

function Stat({ raw, label, format, delay }: StatProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { value, start } = useCountUp(raw);

  useEffect(() => { if (isInView) start(); }, [isInView, start]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: EASE, delay }}
    >
      <p className="text-5xl font-semibold text-white mb-1.5 tabular-nums">
        {format(value)}
      </p>
      <p className="text-sm text-zinc-500">{label}</p>
    </motion.div>
  );
}

export function StepScale({ totals, appCount }: Props) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <StepShell>
      <div ref={ref}>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: EASE }}
          className="text-[10px] font-semibold tracking-[0.22em] text-zinc-600 uppercase mb-10"
        >
          The market is
        </motion.p>
        <div className="space-y-12">
          <Stat raw={totals.downloads} label="downloads / month" format={fmtNum} delay={0.08} />
          <Stat raw={totals.revenue} label="revenue / month" format={fmtMoney} delay={0.18} />
          <Stat raw={appCount} label="competitors mapped" format={n => String(n)} delay={0.28} />
        </div>
      </div>
    </StepShell>
  );
}
