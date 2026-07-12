"use client";

import { useRef } from "react";
import { useInView, motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const CONF = {
  Medium: {
    label: "Medium confidence",
    cls: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  },
  Low: {
    label: "Low confidence",
    cls: "bg-zinc-700/50 text-zinc-500 border-zinc-600/30",
  },
} as const;

type ConfKey = keyof typeof CONF;

const APP = {
  name: "Notion AI",
  category: "Productivity · iOS & Android",
  downloads: { value: "~70K / mo", conf: "Medium" as ConfKey },
  revenue: { value: "$90K / mo", conf: "Low" as ConfKey },
  pricing: "$9.99 / mo · $69.99 / yr",
  complaints: [
    { text: "No offline mode", dots: 4 },
    { text: "Confusing pricing", dots: 3 },
    { text: "Slow sync", dots: 2 },
  ],
};

const TOTAL_DOTS = 4;

export function BeatCompetitorData() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: isInView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.5, delay, ease: EASE },
  });

  return (
    <section
      ref={ref}
      className="relative z-10 border-t border-white/[0.04] px-6 py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">

          {/* Report card — 7 cols, left */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.16, ease: EASE }}
              className="rounded-2xl border border-white/[0.07] bg-zinc-900 p-6"
            >
              {/* App header */}
              <div className="mb-5 flex items-center gap-3 border-b border-white/[0.05] pb-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#8b5cf6]/20 bg-[#8b5cf6]/10 text-[15px]">
                  ✦
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{APP.name}</p>
                  <p className="mt-0.5 text-xs text-zinc-600">{APP.category}</p>
                </div>
              </div>

              {/* Stats row */}
              <div className="mb-5 grid grid-cols-2 gap-3 border-b border-white/[0.05] pb-5">
                <div className="rounded-xl border border-white/[0.05] bg-zinc-950/60 p-3">
                  <p className="mb-1 text-[10px] text-zinc-600">Monthly downloads</p>
                  <p className="mb-2 text-xl font-bold tabular-nums text-white">
                    {APP.downloads.value}
                  </p>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${CONF[APP.downloads.conf].cls}`}
                  >
                    {CONF[APP.downloads.conf].label}
                  </span>
                </div>
                <div className="rounded-xl border border-white/[0.05] bg-zinc-950/60 p-3">
                  <p className="mb-1 text-[10px] text-zinc-600">Revenue estimate</p>
                  <p className="mb-2 text-xl font-bold tabular-nums text-white">
                    {APP.revenue.value}
                  </p>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${CONF[APP.revenue.conf].cls}`}
                  >
                    {CONF[APP.revenue.conf].label}
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
                {APP.complaints.map((c) => (
                  <div
                    key={c.text}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-sm text-zinc-400">{c.text}</span>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {Array.from({ length: TOTAL_DOTS }).map((_, i) => (
                        <span
                          key={i}
                          className="block h-2 w-2 rounded-full"
                          style={{
                            backgroundColor:
                              i < c.dots
                                ? "#2dd4bf"
                                : "rgba(255,255,255,0.07)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.p {...fade(0.36)} className="mt-3 text-xs text-zinc-600">
              Estimates come with confidence levels — real signals, never
              made-up precision.
            </motion.p>
          </div>

          {/* Heading text — 5 cols, right */}
          <div className="lg:col-span-5">
            <motion.p
              {...fade(0)}
              className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-600"
            >
              Per-app analysis
            </motion.p>
            <motion.h2
              {...fade(0.07)}
              className="mb-3 text-3xl font-semibold tracking-tight text-white"
            >
              Know every competitor<br />inside out.
            </motion.h2>
            <motion.p
              {...fade(0.13)}
              className="text-base leading-relaxed text-zinc-500"
            >
              For each app you add, Kove estimates the numbers and reads
              what users actually say.
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}
