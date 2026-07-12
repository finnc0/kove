"use client";

import { useRef } from "react";
import { useInView, motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

const PRESENT = [
  "Daily habit streaks",
  "Push notification reminders",
  "Progress charts and stats",
  "Home screen widgets",
  "Gamification and badges",
];

const GAP =
  "Real social accountability — another person who sees when you slip.";

export function BeatTheGap() {
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
              className="mb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#2dd4bf]"
            >
              The gap
            </motion.p>
            <motion.h2
              {...fade(0.07)}
              className="mb-12 text-3xl font-semibold tracking-tight text-white md:text-4xl"
              style={{ maxWidth: 560 }}
            >
              The opening nobody&apos;s filled.
            </motion.h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              {/* Present — what everyone has */}
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.18, ease: EASE }}
                className="rounded-2xl border border-white/[0.05] bg-zinc-950/60 p-6"
              >
                <p className="mb-5 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
                  Everyone has
                </p>
                <div className="space-y-3">
                  {PRESENT.map((item, i) => (
                    <motion.div
                      key={item}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0 }}
                      animate={isInView ? { opacity: 1 } : {}}
                      transition={{ delay: 0.27 + i * 0.07 }}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.05]">
                        <Check className="h-3 w-3 text-zinc-600" />
                      </span>
                      <span className="text-sm text-zinc-500">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* The gap — what nobody has */}
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
                  Nobody has
                </p>
                <div className="relative mb-6 flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#2dd4bf]/20 bg-[#2dd4bf]/10">
                    <X className="h-3 w-3 text-[#2dd4bf]" />
                  </span>
                  <p className="text-base font-medium leading-snug text-white">{GAP}</p>
                </div>
                <div className="relative flex items-center gap-2">
                  <motion.span className="relative flex h-2 w-2">
                    <motion.span
                      className="absolute inline-flex h-full w-full rounded-full bg-[#2dd4bf]"
                      animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                    />
                    <span className="relative h-2 w-2 rounded-full bg-[#2dd4bf]" />
                  </motion.span>
                  <p className="text-xs text-[#2dd4bf]/60">
                    Confirmed across all 4 analyzed apps
                  </p>
                </div>
              </motion.div>
            </div>

            {/* CTA */}
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
