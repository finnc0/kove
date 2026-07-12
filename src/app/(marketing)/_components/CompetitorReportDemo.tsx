"use client";

import { useRef, useEffect, useState } from "react";
import { useInView, motion } from "framer-motion";
import { APPS } from "../landing/sampleMarket";

const EASE = [0.22, 1, 0.36, 1] as const;
const TOTAL_DOTS = 4;
const APP = APPS[0];

const COMPLAINTS = [
  { text: "No web clipper on mobile", dots: 4 },
  { text: "Confusing pricing tiers", dots: 3 },
  { text: "AI context resets on close", dots: 3 },
];

function useCountUp(target: number, active: boolean, duration = 900) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    const end = target;
    function step(ts: number) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * end));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return count;
}

export function CompetitorReportDemo() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const downloads = useCountUp(42, isInView, 900);
  const revenue = useCountUp(85, isInView, 1100);

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: isInView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.5, delay, ease: EASE },
  });

  return (
    <section ref={ref} className="relative z-10 border-t border-white/[0.04] px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">

          {/* Card — left 7 cols */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.16, ease: EASE }}
              className="rounded-2xl border border-white/[0.07] bg-zinc-900 p-6"
            >
              {/* App header */}
              <div className="mb-5 flex items-center gap-3 border-b border-white/[0.05] pb-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-zinc-800 text-xs font-semibold text-zinc-400">
                  T
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{APP.name}</p>
                  <p className="mt-0.5 text-xs text-zinc-600">{APP.description} · iOS &amp; Android</p>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <span className="text-sm font-semibold text-white">★ {APP.rating}</span>
                  <span className="text-xs text-zinc-600">({(APP.reviews / 1000).toFixed(1)}K)</span>
                </div>
              </div>

              {/* Stats */}
              <div className="mb-5 grid grid-cols-2 gap-3 border-b border-white/[0.05] pb-5">
                <div className="rounded-xl border border-white/[0.05] bg-zinc-950/60 p-4">
                  <p className="mb-1 text-[10px] text-zinc-600">Monthly downloads</p>
                  <p className="mb-2 text-2xl font-bold tabular-nums text-white">
                    {downloads}K / mo
                  </p>
                  <span className="rounded-full border border-zinc-600/30 bg-zinc-700/20 px-2 py-0.5 text-[10px] text-zinc-400">
                    Medium confidence
                  </span>
                </div>
                <div className="rounded-xl border border-white/[0.05] bg-zinc-950/60 p-4">
                  <p className="mb-1 text-[10px] text-zinc-600">Revenue estimate</p>
                  <p className="mb-2 text-2xl font-bold tabular-nums text-white">
                    ${revenue}K / mo
                  </p>
                  <span className="rounded-full border border-zinc-600/30 bg-zinc-700/20 px-2 py-0.5 text-[10px] text-zinc-400">
                    Medium confidence
                  </span>
                </div>
              </div>

              {/* Pricing */}
              <div className="mb-5 flex items-center justify-between border-b border-white/[0.05] pb-5">
                <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">
                  Pricing
                </p>
                <p className="text-sm font-medium text-zinc-300">{APP.pricing}</p>
              </div>

              {/* Top complaints */}
              <p className="mb-3 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
                Top complaints
              </p>
              <div className="space-y-3">
                {COMPLAINTS.map((c, i) => (
                  <motion.div
                    key={c.text}
                    initial={{ opacity: 0, x: -8 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.45 + i * 0.08, ease: EASE }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-zinc-700">—</span>
                    <span className="text-sm text-zinc-400">{c.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.p {...fade(0.42)} className="mt-3 text-xs text-zinc-600">
              Estimates carry confidence levels — real signals, never made-up precision.
            </motion.p>
          </div>

          {/* Copy — right 5 cols */}
          <div className="lg:col-span-5">
            <motion.p
              {...fade(0)}
              className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-600"
            >
              Per-app analysis
            </motion.p>
            <motion.h2
              {...fade(0.07)}
              className="mb-4 text-3xl font-semibold tracking-tight text-white"
            >
              Know every competitor<br />inside out.
            </motion.h2>
            <motion.p {...fade(0.13)} className="mb-6 text-base leading-relaxed text-zinc-500">
              For each app you add, Kove estimates real download and revenue numbers, reads thousands of reviews, and surfaces the patterns that matter.
            </motion.p>
            <motion.div {...fade(0.2)} className="space-y-3">
              {[
                "Estimated monthly downloads & revenue",
                "Real review-sourced complaints",
                "Pricing model breakdown",
                "Platform coverage at a glance",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="text-zinc-600">—</span>
                  <span className="text-sm text-zinc-400">{item}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
