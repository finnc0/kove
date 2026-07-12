"use client";

import { useRef, useState } from "react";
import {
  useScroll,
  useTransform,
  useMotionValueEvent,
  motion,
  useReducedMotion,
} from "framer-motion";
import { APPS } from "../landing/sampleMarket";

const EASE = [0.22, 1, 0.36, 1] as const;
const TOTAL_DOTS = 4;

const STAGES = [
  {
    dots: 1,
    label: "Weak signal",
    app: "Turbo AI",
    dotColor: "rgba(255,255,255,0.22)",
    labelColor: "text-zinc-600",
  },
  {
    dots: 2,
    label: "Getting clearer",
    app: "Studley confirms it",
    dotColor: "rgba(255,255,255,0.45)",
    labelColor: "text-zinc-400",
  },
  {
    dots: 3,
    label: "Pattern emerging",
    app: "Coconote confirms it",
    dotColor: "rgba(255,255,255,0.65)",
    labelColor: "text-zinc-300",
  },
  {
    dots: 4,
    label: "Strong — this is real",
    app: "Notee confirms it",
    dotColor: "rgba(255,255,255,0.9)",
    labelColor: "text-white",
  },
];

export function SignalStrengthDemo() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.15"],
  });

  const stageRaw = useTransform(scrollYProgress, [0, 0.33, 0.66, 1], [0, 1, 2, 3]);
  const [stageIdx, setStageIdx] = useState(reduced ? 3 : 0);

  useMotionValueEvent(stageRaw, "change", (v) => {
    if (!reduced) setStageIdx(Math.min(3, Math.max(0, Math.floor(v))));
  });

  const stage = STAGES[stageIdx];

  return (
    <section
      ref={ref}
      className="relative z-10 border-t border-white/[0.04]"
      style={{ minHeight: "200vh" }}
    >
      <div className="sticky top-0 flex min-h-screen items-center justify-center px-6 py-20">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-col items-center text-center">

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: EASE }}
              className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-600"
            >
              Pain signal strength
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08, ease: EASE }}
              className="mb-3 text-3xl font-semibold tracking-tight text-white"
            >
              Every competitor sharpens the signal.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
              className="mb-16 max-w-xl text-base text-zinc-500"
            >
              One app is an anecdote. Four apps reporting the same complaint is a market opportunity.
            </motion.p>

            {/* Main pain card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
              className="w-full max-w-sm rounded-3xl border border-white/[0.07] bg-zinc-900 px-8 py-8"
            >
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
                Pain point
              </p>
              <p className="mb-6 text-base font-medium text-zinc-200">
                No reliable offline mode
              </p>

              {/* Dots */}
              <div className="mb-5 flex items-center justify-center gap-3">
                {Array.from({ length: TOTAL_DOTS }).map((_, i) => (
                  <motion.span
                    key={i}
                    className="block h-3.5 w-3.5 rounded-full"
                    animate={{
                      backgroundColor:
                        i < stage.dots ? stage.dotColor : "rgba(255,255,255,0.07)",
                      scale: !reduced && i === stage.dots - 1 ? [1, 1.4, 1] : 1,
                    }}
                    transition={{ duration: 0.35, ease: EASE }}
                  />
                ))}
              </div>

              {/* Stage info */}
              <motion.div
                key={stageIdx}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs text-zinc-500">{stage.app}</span>
                </div>
                <p className={`text-sm font-semibold ${stage.labelColor}`}>{stage.label}</p>
              </motion.div>
            </motion.div>

            {/* App evidence row */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mt-6 flex items-center gap-3"
            >
              {APPS.map((app, i) => (
                <motion.div
                  key={app.id}
                  animate={{
                    opacity: i < stage.dots ? 1 : 0.2,
                    scale: i < stage.dots ? 1 : 0.9,
                  }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="rounded-lg border border-white/[0.06] bg-zinc-900 px-2.5 py-1.5"
                >
                  <span className="text-[11px] text-zinc-500">{app.name}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Scroll hint */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-6 text-xs text-zinc-700"
            >
              {stageIdx < 3
                ? "Keep scrolling to build the signal"
                : "Pattern confirmed across all 4 apps"}
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}
