"use client";

import { useRef } from "react";
import { useInView, motion } from "framer-motion";

const EASE: [number,number,number,number] = [0.22, 1, 0.36, 1];

// Pain points: how many apps confirm each one (out of 5 max)
const PAIN_POINTS = [
  { text: "No data export or backup",            confirmed: 5 },
  { text: "Core features locked behind paywall", confirmed: 4 },
  { text: "Accountability is a solo feature",    confirmed: 5 },
  { text: "Notifications too aggressive",        confirmed: 3 },
  { text: "No habit dependency logic",           confirmed: 4 },
];

const MAX_DOTS = 5;

function StrengthDots({ confirmed, isInView, delay }: { confirmed: number; isInView: boolean; delay: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: MAX_DOTS }).map((_, i) => (
        <motion.span
          key={i}
          className="block w-2 h-2 rounded-full"
          style={{ backgroundColor: i < confirmed ? "#2dd4bf" : "rgba(255,255,255,0.07)" }}
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{
            duration: 0.25,
            delay: delay + i * 0.07,
            ease: EASE,
          }}
        />
      ))}
      <span className="ml-1.5 text-[11px] text-zinc-600 tabular-nums">
        {confirmed}/{MAX_DOTS} apps
      </span>
    </div>
  );
}

export default function SectionFindings() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <section ref={ref} className="px-6 py-28 border-t border-white/[0.04]">
      <div className="mx-auto max-w-[1100px]">

        <div className="flex flex-col lg:flex-row gap-16 items-start">

          {/* Left: headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: EASE }}
            className="max-w-[360px] shrink-0"
          >
            <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-zinc-600 mb-3">
              Findings sharpen
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-4">
              One app is a signal.<br />
              <span className="text-zinc-500">Four apps is a pattern.</span>
            </h2>
            <p className="text-base text-zinc-500 leading-relaxed">
              The more competitors you add, the stronger the signal. Pain points confirmed across five apps aren&apos;t noise — they&apos;re the market&apos;s honest request.
            </p>
          </motion.div>

          {/* Right: pain points with signal strength */}
          <div className="flex-1 min-w-0 space-y-px">
            {PAIN_POINTS.map((pp, i) => (
              <motion.div
                key={pp.text}
                initial={{ opacity: 0, x: 16 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.15 + i * 0.1, ease: EASE }}
                className="flex items-center justify-between gap-4 rounded-xl px-5 py-4 border border-white/[0.05] bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
              >
                <span className="text-sm text-zinc-300">{pp.text}</span>
                <StrengthDots
                  confirmed={pp.confirmed}
                  isInView={isInView}
                  delay={0.25 + i * 0.1}
                />
              </motion.div>
            ))}

            {/* Legend */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.75 }}
              className="flex items-center gap-3 pt-4 pl-1"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2dd4bf]" />
                <span className="text-xs text-zinc-600">Confirmed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white/[0.07]" />
                <span className="text-xs text-zinc-600">Not found</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
