"use client";

import { useRef } from "react";
import { useInView, motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const REASONS = [
  {
    label: "Validate before you build",
    desc: "Know if a market has a real gap before writing a line of code. Real data from real reviews — not guesswork.",
  },
  {
    label: "Skip weeks of manual research",
    desc: "What used to take spreadsheets, Reddit threads, and App Store scraping — done in minutes, automatically.",
  },
  {
    label: "Move with confidence",
    desc: "Pricing, demand signals, and ranked pain points from actual App Store data. Make positioning decisions you can defend.",
  },
];

export function WhyFounders() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="relative z-10 border-t border-white/[0.04] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-600"
        >
          Built for founders
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.07, ease: EASE }}
          className="mb-12 text-2xl font-semibold tracking-tight text-white"
        >
          Built for the research,<br />not the busywork.
        </motion.h2>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-white/[0.05] bg-white/[0.04] md:grid-cols-3">
          {REASONS.map((r, i) => (
            <motion.div
              key={r.label}
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.1 + i * 0.1, ease: EASE }}
              className="bg-zinc-950 px-8 py-8"
            >
              <p className="mb-2 text-sm font-semibold text-white">{r.label}</p>
              <p className="text-sm leading-relaxed text-zinc-500">{r.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
