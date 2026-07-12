"use client";

import { useRef } from "react";
import { useInView, motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PAIN_POINTS, MARKET_GAP } from "../landing/sampleMarket";

const EASE = [0.22, 1, 0.36, 1] as const;
const TOTAL_DOTS = 4;

export function FindingsReportDemo() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: isInView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.5, delay, ease: EASE },
  });

  return (
    <section ref={ref} className="relative z-10 border-t border-white/[0.04] px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-3xl border border-white/[0.07] bg-zinc-900">
          <div className="px-8 py-10 md:px-12 md:py-14">

            <motion.p
              {...fade(0)}
              className="mb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-500"
            >
              Findings — AI note-taking apps
            </motion.p>
            <motion.h2
              {...fade(0.07)}
              className="mb-12 text-3xl font-semibold tracking-tight text-white md:text-4xl"
              style={{ maxWidth: 560 }}
            >
              The gap nobody&apos;s filling.
            </motion.h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              {/* Pain points list */}
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.18, ease: EASE }}
                className="rounded-2xl border border-white/[0.05] bg-zinc-950/60 p-6"
              >
                <p className="mb-5 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
                  Top pain points
                </p>
                <div className="space-y-4">
                  {PAIN_POINTS.map((pain, i) => (
                    <motion.div
                      key={pain.rank}
                      initial={{ opacity: 0, x: -8 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.28 + i * 0.07, ease: EASE }}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm text-zinc-400">{pain.text}</p>
                        <p className="mt-0.5 text-[10px] text-zinc-700">
                          {pain.apps.join(" · ")}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {Array.from({ length: TOTAL_DOTS }).map((_, j) => (
                          <span
                            key={j}
                            className="block h-2 w-2 rounded-full"
                            style={{
                              backgroundColor:
                                j < pain.signal
                                  ? "rgba(228,228,231,0.55)"
                                  : "rgba(255,255,255,0.07)",
                            }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* The gap */}
              <motion.div
                initial={{ opacity: 0, x: 12, scale: 1.02 }}
                animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
                transition={{ duration: 0.55, delay: 0.33, ease: EASE }}
                className="relative overflow-hidden rounded-2xl border border-[#2dd4bf]/20 bg-[#2dd4bf]/[0.04] p-6"
              >
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(45,212,191,0.08) 0%, transparent 70%)",
                  }}
                />
                <p className="relative mb-5 text-[10px] font-medium uppercase tracking-widest text-[#2dd4bf]/60">
                  The gap
                </p>
                <p className="relative mb-3 text-base font-semibold leading-snug text-white">
                  {MARKET_GAP.title}
                </p>
                <p className="relative mb-5 text-sm leading-relaxed text-zinc-500">
                  {MARKET_GAP.opportunity}
                </p>
                <p className="text-xs text-zinc-600">
                  Confirmed across {MARKET_GAP.confirmedBy} analyzed apps
                </p>
              </motion.div>
            </div>

            <motion.div {...fade(0.56)} className="mt-10">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-xl bg-[#2dd4bf] px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-[#5eead4]"
              >
                Find your gap
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
