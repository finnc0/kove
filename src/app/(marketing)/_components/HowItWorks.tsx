"use client";

import { useRef } from "react";
import { useInView, motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  {
    num: "01",
    label: "Pick a niche",
    desc: "Create a workspace for the market you're exploring.",
  },
  {
    num: "02",
    label: "Add competitors",
    desc: "Drop in any app. Kove pulls its real data and reviews.",
  },
  {
    num: "03",
    label: "Find the gap",
    desc: "Kove synthesizes every competitor into one opportunity map.",
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative z-10 border-t border-white/[0.04] px-6 py-32"
    >
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-16 text-3xl font-semibold tracking-tight text-white"
        >
          How Kove works
        </motion.h2>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.04] md:grid-cols-3">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.12, ease: EASE }}
              className="bg-zinc-950 p-8"
            >
              <p className="mb-5 text-4xl font-bold tracking-tight text-zinc-800">
                {step.num}
              </p>
              <p className="mb-2 text-base font-semibold text-white">{step.label}</p>
              <p className="text-sm leading-relaxed text-zinc-500">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
