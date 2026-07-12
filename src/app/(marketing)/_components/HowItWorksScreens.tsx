"use client";

import { useRef } from "react";
import { useInView, motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

function WindowChrome({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-4 py-2.5">
      <span className="h-1.5 w-1.5 rounded-full bg-white/[0.08]" />
      <span className="h-1.5 w-1.5 rounded-full bg-white/[0.08]" />
      <span className="h-1.5 w-1.5 rounded-full bg-white/[0.08]" />
      <span className="ml-2 text-[10px] text-zinc-700">{label}</span>
    </div>
  );
}

function Step1Screen() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900">
      <WindowChrome label="Add competitor" />
      <div className="p-5">
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-zinc-950/60 px-3 py-2.5">
          <span className="font-mono text-[10px] text-zinc-600 truncate">
            apps.apple.com/us/app/turbo-ai-notes/id...
          </span>
          <span className="ml-auto shrink-0 rounded-lg bg-[#2dd4bf]/10 px-2 py-0.5 text-[9px] font-semibold text-[#2dd4bf]">
            Add
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["Turbo AI", "Studley", "Coconote"].map((name) => (
            <span
              key={name}
              className="rounded-lg border border-white/[0.07] bg-zinc-800/60 px-2.5 py-1 text-[11px] text-zinc-400"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step2Screen() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900">
      <WindowChrome label="Turbo AI — Analysis" />
      <div className="p-5">
        <div className="mb-3 flex items-center gap-3 border-b border-white/[0.05] pb-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-zinc-800 text-sm text-zinc-500">
            T
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Turbo AI</p>
            <p className="text-[10px] text-zinc-600">AI notes · iOS & Android</p>
          </div>
        </div>
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/[0.05] bg-zinc-950/60 p-3">
            <p className="mb-1 text-[9px] text-zinc-600">Monthly downloads</p>
            <p className="text-base font-bold tabular-nums text-white">42K / mo</p>
            <span className="mt-1.5 inline-block rounded-full border border-zinc-600/30 bg-zinc-700/20 px-1.5 py-0.5 text-[9px] text-zinc-400">
              Medium conf.
            </span>
          </div>
          <div className="rounded-xl border border-white/[0.05] bg-zinc-950/60 p-3">
            <p className="mb-1 text-[9px] text-zinc-600">Revenue estimate</p>
            <p className="text-base font-bold tabular-nums text-white">$85K / mo</p>
            <span className="mt-1.5 inline-block rounded-full border border-zinc-600/30 bg-zinc-700/20 px-1.5 py-0.5 text-[9px] text-zinc-400">
              Medium conf.
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-widest text-zinc-600">Top pain</span>
          <span className="text-[11px] text-zinc-400">No web clipper</span>
        </div>
      </div>
    </div>
  );
}

function Step3Screen() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#2dd4bf]/20 bg-[#2dd4bf]/[0.04]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(45,212,191,0.12) 0%, transparent 70%)",
        }}
      />
      <div className="relative flex items-center gap-1.5 border-b border-[#2dd4bf]/[0.08] px-4 py-2.5">
        <span className="h-1.5 w-1.5 rounded-full bg-white/[0.08]" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/[0.08]" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/[0.08]" />
        <span className="ml-2 text-[10px] text-[#2dd4bf]/50">The gap</span>
      </div>
      <div className="relative p-5">
        <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#2dd4bf]/60">
          Gap identified
        </p>
        <p className="mb-3 text-sm font-semibold leading-snug text-white">
          Offline-first notes with reliable sync and one-tap PDF export
        </p>
        <p className="mb-4 text-[11px] leading-relaxed text-zinc-500">
          No player handles both offline sync and export reliably. Confirmed across 3 apps.
        </p>
        <p className="text-[10px] text-zinc-600">Confirmed across 3 apps</p>
      </div>
    </div>
  );
}

const STEPS = [
  {
    num: "01",
    label: "Add any competitor",
    desc: "Drop in any App Store or Play Store URL. Kove pulls real data and reviews instantly.",
    Screen: Step1Screen,
  },
  {
    num: "02",
    label: "Get the full picture",
    desc: "Downloads, revenue estimates, pricing, and top user complaints — all in one view.",
    Screen: Step2Screen,
  },
  {
    num: "03",
    label: "Find your gap",
    desc: "Kove synthesizes every competitor into one clear market gap: the opportunity nobody's filled.",
    Screen: Step3Screen,
  },
];

export function HowItWorksScreens() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative z-10 border-t border-white/[0.04] px-6 py-32"
    >
      <div className="mx-auto max-w-6xl">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-600"
        >
          How it works
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.07, ease: EASE }}
          className="mb-16 text-3xl font-semibold tracking-tight text-white"
        >
          From URL to opportunity in minutes.
        </motion.h2>

        <div className="grid grid-cols-1 gap-14 lg:grid-cols-3">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.12, ease: EASE }}
            >
              <div className="mb-6">
                <step.Screen />
              </div>
              <p className="mb-2 text-4xl font-bold tracking-tight text-zinc-800">{step.num}</p>
              <p className="mb-2 text-base font-semibold text-white">{step.label}</p>
              <p className="text-sm leading-relaxed text-zinc-500">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
