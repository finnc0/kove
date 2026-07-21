"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduced = useReducedMotion();

  const fade = (delay: number) => ({
    initial: reduced ? {} : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: EASE },
  });

  return (
    <section className="relative min-h-screen pt-14 flex items-center">
      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 py-20 text-center">
        <motion.p
          {...fade(0.04)}
          className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500"
        >
          Market research for app builders
        </motion.p>

        <motion.h1
          {...fade(0.13)}
          className="mb-5 font-semibold tracking-tight text-white leading-[1.05]"
          style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.6rem)" }}
        >
          See the whole market<br />
          <span className="text-zinc-500">before you build.</span>
        </motion.h1>

        <motion.p
          {...fade(0.22)}
          className="mb-8 text-lg leading-relaxed text-zinc-400 max-w-xl mx-auto"
        >
          Kove analyzes your competitors&apos; downloads, revenue,
          pricing, and reviews — then shows you the gap worth
          building into.
        </motion.p>

        <motion.div
          {...fade(0.31)}
          className="mb-4 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-xl bg-[#2dd4bf] px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-[#5eead4]"
          >
            Analyze a market free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#how-it-works"
            className="rounded-xl border border-white/[0.08] px-5 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:border-white/[0.16] hover:text-white"
          >
            See how it works
          </a>
        </motion.div>

        <motion.p {...fade(0.39)} className="text-xs text-zinc-600">
          No credit card · Your first market in 2 minutes
        </motion.p>
      </div>
    </section>
  );
}
