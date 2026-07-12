"use client";

import { useRef } from "react";
import { useInView, motion } from "framer-motion";

const EASE: [number,number,number,number] = [0.22, 1, 0.36, 1];

const STATS = [
  {
    value:  "124K",
    label:  "Monthly downloads",
    source: "App Store API + ratings model",
    confidence: "High",
    color:  "#2dd4bf",
  },
  {
    value:  "$3.2M",
    label:  "Revenue / year",
    source: "IAP data + download model",
    confidence: "Medium",
    color:  "#fb923c",
  },
  {
    value:  "4.4 / 5",
    label:  "Average rating",
    source: "App Store API — exact",
    confidence: "Exact",
    color:  "#2dd4bf",
  },
  {
    value:  "34",
    label:  "Distinct pain point themes",
    source: "2,400 reviews analyzed",
    confidence: "High",
    color:  "#2dd4bf",
  },
];

const CONF_STYLE: Record<string, string> = {
  High:   "bg-[#2dd4bf]/10 text-[#2dd4bf] border-[#2dd4bf]/20",
  Medium: "bg-[#fb923c]/10 text-[#fb923c] border-[#fb923c]/20",
  Exact:  "bg-white/[0.05] text-zinc-300 border-white/[0.1]",
};

export default function SectionData() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <section ref={ref} className="px-6 py-28 border-t border-white/[0.04]">
      <div className="mx-auto max-w-[1100px]">

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-16 max-w-lg"
        >
          <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-zinc-600 mb-3">
            Real data, not guesses
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-3">
            Estimates with confidence levels.<br />
            <span className="text-zinc-500">Not made-up numbers.</span>
          </h2>
          <p className="text-base text-zinc-500 leading-relaxed">
            Our estimation engine tells you what it knows and how well it knows it — so you build on grounded data, not AI hallucinations.
          </p>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.09, ease: EASE }}
              className="rounded-2xl border border-white/[0.07] bg-zinc-900 p-5 flex flex-col gap-4"
            >
              <p
                className="text-3xl font-bold tracking-tight tabular-nums"
                style={{ color: stat.confidence === "Medium" ? "#fb923c" : "white" }}
              >
                {stat.value}
              </p>
              <div>
                <p className="text-sm font-medium text-zinc-300 mb-1">{stat.label}</p>
                <p className="text-xs text-zinc-600 leading-snug">{stat.source}</p>
              </div>
              <span className={`self-start text-[10px] font-semibold border rounded-full px-2.5 py-0.5 tracking-wide ${CONF_STYLE[stat.confidence]}`}>
                {stat.confidence} confidence
              </span>
            </motion.div>
          ))}
        </div>

        {/* Integrity note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="mt-6 text-xs text-zinc-700 text-center"
        >
          Confidence levels are shown on every estimate — Kove never hides uncertainty.
        </motion.p>
      </div>
    </section>
  );
}
