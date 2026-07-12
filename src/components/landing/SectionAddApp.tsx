"use client";

import { useRef, useState, useEffect } from "react";
import { useInView, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const TARGET_URL = "apps.apple.com/us/app/finch/id1528595748";
const EASE: [number,number,number,number] = [0.22, 1, 0.36, 1];

const SOURCES = [
  { label: "App Store metadata + ratings",     color: "#3b82f6" },
  { label: "2,400 reviews analyzed",           color: "#8b5cf6" },
  { label: "Reddit community discussion",      color: "#fb923c" },
  { label: "Developer pricing page",           color: "#2dd4bf" },
];

const PAIN_POINTS = [
  { text: "No data export or backup",             severity: "H" },
  { text: "Core features locked behind paywall",  severity: "H" },
  { text: "Notifications inconsistent on iOS 17", severity: "M" },
];

const SEV_COLOR: Record<string, string> = {
  H: "bg-red-500/60",
  M: "bg-amber-500/60",
  L: "bg-green-500/60",
};

export default function SectionAddApp() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-120px" });

  const [typed, setTyped]   = useState(0);
  const [phase, setPhase]   = useState(0);

  useEffect(() => {
    if (!isInView || phase > 0) return;
    setPhase(1);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setTyped(i);
      if (i >= TARGET_URL.length) {
        clearInterval(iv);
        setTimeout(() => setPhase(2), 280);
        setTimeout(() => setPhase(3), 1500);
      }
    }, 28);
    return () => clearInterval(iv);
  }, [isInView, phase]);

  return (
    <section ref={ref} className="px-6 py-28 border-t border-white/[0.04]">
      <div className="mx-auto max-w-[1100px]">

        {/* Label + headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-16 max-w-lg"
        >
          <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-zinc-600 mb-3">
            Add competitors
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-3">
            Drop in a URL.<br />Get a full profile.
          </h2>
          <p className="text-base text-zinc-500 leading-relaxed">
            Paste any App Store link. Kove fetches reviews, Reddit threads, and developer pricing — then synthesizes a structured competitive brief.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left: URL input → source checklist */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
            className="rounded-2xl border border-white/[0.07] bg-zinc-900 p-6"
          >
            <p className="text-[11px] font-medium text-zinc-600 uppercase tracking-widest mb-3">
              App Store URL
            </p>
            {/* Input mock */}
            <div className="flex items-center gap-2 rounded-xl bg-zinc-950 border border-white/[0.08] px-4 py-3 mb-6 min-h-[44px]">
              <span className="text-sm text-zinc-400 font-mono leading-snug break-all">
                {TARGET_URL.slice(0, typed)}
                {phase === 1 && typed < TARGET_URL.length && (
                  <span className="inline-block w-0.5 h-[14px] bg-zinc-300 ml-0.5 align-middle animate-pulse" />
                )}
              </span>
            </div>

            {/* Source checklist */}
            <div className="space-y-3">
              {SOURCES.map((src, i) => (
                <motion.div
                  key={src.label}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: phase >= 2 ? 1 : 0, x: phase >= 2 ? 0 : -8 }}
                  transition={{ duration: 0.3, delay: i * 0.16, ease: EASE }}
                >
                  <CheckCircle2
                    className="w-4 h-4 shrink-0"
                    style={{ color: src.color }}
                  />
                  <span className="text-sm text-zinc-400">{src.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: node card materializing */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.25, ease: EASE }}
          >
            <motion.div
              className="rounded-2xl border border-white/[0.07] bg-zinc-900 p-6 h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 3 ? 1 : 0 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              {/* App header */}
              <div className="flex items-start gap-3 mb-6 pb-6 border-b border-white/[0.06]">
                <div className="w-11 h-11 rounded-xl bg-[#f472b6]/10 border border-[#f472b6]/20 flex items-center justify-center shrink-0 text-xl">
                  🐧
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">Finch: Self Care Pet</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Health & Fitness · iOS</p>
                  <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-1.5">
                    <span className="text-xs text-zinc-400">★ 4.7</span>
                    <span className="text-zinc-700 text-xs">·</span>
                    <span className="text-xs text-zinc-500">241.8K reviews</span>
                    <span className="text-zinc-700 text-xs">·</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-white/[0.06]">
                      Freemium
                    </span>
                  </div>
                </div>
              </div>

              {/* Pain points */}
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600 mb-3">
                Top pain points
              </p>
              <div className="space-y-2">
                {PAIN_POINTS.map((pp) => (
                  <div key={pp.text} className="flex items-center gap-2.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${SEV_COLOR[pp.severity]}`} />
                    <span className="text-sm text-zinc-400">{pp.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
