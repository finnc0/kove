"use client";

import { useRef, useState } from "react";
import {
  useScroll,
  useTransform,
  useMotionValueEvent,
  motion,
  useReducedMotion,
} from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const STAGES = [
  {
    dots: 1,
    label: "Weak signal",
    app: "1 app added",
    dotColor: "rgba(255,255,255,0.25)",
    labelColor: "text-zinc-600",
  },
  {
    dots: 2,
    label: "Getting clearer",
    app: "2 apps added",
    dotColor: "#f59e0b",
    labelColor: "text-amber-400",
  },
  {
    dots: 3,
    label: "Getting clearer",
    app: "3 apps added",
    dotColor: "#f59e0b",
    labelColor: "text-amber-400",
  },
  {
    dots: 4,
    label: "Strong — this is real",
    app: "4 apps added",
    dotColor: "#2dd4bf",
    labelColor: "text-[#2dd4bf]",
  },
];

const TOTAL_DOTS = 4;
const PAIN = "No export or backup feature";

export function BeatSignalStrength() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.15"],
  });

  const stageRaw = useTransform(scrollYProgress, [0, 0.33, 0.66, 1], [0, 1, 2, 3]);
  const [stageIdx, setStageIdx] = useState(reduced ? 3 : 0);

  useMotionValueEvent(stageRaw, "change", (v) => {
    if (!reduced) setStageIdx(Math.min(3, Math.floor(v)));
  });

  const stage = STAGES[stageIdx];

  return (
    <section
      ref={ref}
      className="relative z-10 border-t border-white/[0.04]"
      style={{ minHeight: "190vh" }}
    >
      <div className="sticky top-0 flex min-h-screen items-center justify-center px-6 py-20">
        <div className="mx-auto w-full max-w-6xl text-center">

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-600"
          >
            Step three
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08, ease: EASE }}
            className="mb-3 text-3xl font-semibold tracking-tight text-white"
          >
            Every competitor sharpens the picture.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
            className="mb-16 text-base text-zinc-500"
          >
            One app is an anecdote. Four apps with the same complaint is a
            market opportunity.
          </motion.p>

          {/* Pain card with scrubbed dots */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.16, ease: EASE }}
            className="inline-flex flex-col items-center gap-6 rounded-3xl border border-white/[0.07] bg-zinc-900 px-10 py-10"
          >
            <p className="text-base font-medium text-zinc-300">{PAIN}</p>

            {/* Dots */}
            <div className="flex items-center gap-3">
              {Array.from({ length: TOTAL_DOTS }).map((_, i) => (
                <motion.span
                  key={i}
                  className="block h-3 w-3 rounded-full"
                  animate={{
                    backgroundColor:
                      i < stage.dots ? stage.dotColor : "rgba(255,255,255,0.07)",
                    scale: !reduced && i === stage.dots - 1 ? [1, 1.35, 1] : 1,
                  }}
                  transition={{ duration: 0.35, ease: EASE }}
                />
              ))}
            </div>

            {/* Stage label — keyed to force re-mount on change */}
            <motion.div
              key={stageIdx}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-3"
            >
              <span className="text-xs text-zinc-600">{stage.app}</span>
              <span className="text-zinc-700">·</span>
              <span className={`text-xs font-semibold ${stage.labelColor}`}>
                {stage.label}
              </span>
            </motion.div>
          </motion.div>

          {/* Scroll hint */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 text-xs text-zinc-700"
          >
            {stageIdx < 3
              ? "Keep scrolling to strengthen the signal"
              : "Pattern confirmed across 4 apps"}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
