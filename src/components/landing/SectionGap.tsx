"use client";

import { useRef } from "react";
import { useInView, motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";

const EASE: [number,number,number,number] = [0.22, 1, 0.36, 1];

const PRESENT = [
  "Daily habit streaks",
  "Push notification reminders",
  "Progress charts & stats",
  "Home screen widgets",
  "Badge & reward systems",
];

const GAP_ITEM = "Real social accountability — another person who sees when you slip.";

export default function SectionGap() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <section ref={ref} className="px-6 py-32 border-t border-white/[0.04]">
      <div className="mx-auto max-w-[1100px]">

        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: EASE }}
          className="text-[10px] font-semibold tracking-[0.28em] uppercase text-[#2dd4bf] mb-6"
        >
          The gap
        </motion.p>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.08, ease: EASE }}
          className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.05] mb-16"
          style={{ maxWidth: "640px" }}
        >
          Everyone has streaks.<br />
          <span className="text-zinc-500">Nobody has accountability.</span>
        </motion.h2>

        {/* Two-column comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-14">

          {/* Present */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
            className="rounded-2xl border border-white/[0.06] bg-zinc-900/50 p-7"
          >
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-zinc-600 mb-5">
              Present in every competitor
            </p>
            <div className="space-y-3.5">
              {PRESENT.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -8 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.35, delay: 0.28 + i * 0.08, ease: EASE }}
                  className="flex items-center gap-3"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                    <Check className="w-3 h-3 text-zinc-500" />
                  </span>
                  <span className="text-sm text-zinc-500">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* The gap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.35, ease: EASE }}
            className="rounded-2xl border border-[#2dd4bf]/20 bg-[#2dd4bf]/[0.04] p-7 relative overflow-hidden"
          >
            {/* Subtle glow */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(45,212,191,0.07) 0%, transparent 70%)",
              }}
            />
            <p className="relative text-[10px] font-semibold tracking-[0.2em] uppercase text-[#2dd4bf]/70 mb-5">
              Missing from every competitor
            </p>
            <div className="relative flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 mt-0.5">
                <X className="w-3 h-3 text-[#2dd4bf]" />
              </span>
              <p className="text-base font-medium text-white leading-snug">{GAP_ITEM}</p>
            </div>

            {/* Pulse dot in corner */}
            <div className="relative mt-8 flex items-center gap-2.5">
              <motion.span
                className="relative flex h-2.5 w-2.5 shrink-0"
              >
                <motion.span
                  className="absolute inline-flex h-full w-full rounded-full bg-[#2dd4bf]"
                  animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#2dd4bf]" />
              </motion.span>
              <p className="text-xs text-[#2dd4bf]/70">Confirmed across all 5 analyzed apps</p>
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.5, ease: EASE }}
        >
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-xl bg-[#2dd4bf] px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-[#5eead4] transition-colors"
          >
            Find your gap
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
