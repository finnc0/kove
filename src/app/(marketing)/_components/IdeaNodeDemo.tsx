"use client";

import { useRef } from "react";
import { useInView, motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

const IDEA = {
  text: "Offline-first note app with one-tap PDF + Markdown export",
  targetUser: "Students and knowledge workers on mobile",
  keyEdge: "Works fully offline, exports in one tap",
  verdict: "strong" as const,
  verdictLabel: "Strong signal",
  summary:
    "This idea directly addresses the top 2 confirmed pain points across all 4 analyzed apps. The offline + export gap is real, proven, and nobody's building into it yet.",
  gapsFilled: [
    { gap: "Offline mode that actually works", matched: true },
    { gap: "PDF and Markdown export", matched: true },
    { gap: "Cross-platform sync reliability", matched: false },
  ],
  painsSolved: [
    { pain: "No reliable offline mode", signal: 4 },
    { pain: "Can't export to PDF or Markdown", signal: 3 },
  ],
  overlaps: [
    { competitor: "Coconote", reason: "Shares real-time collaboration angle" },
  ],
};

const VERDICT_DOT: Record<string, string> = {
  strong: "bg-[#2dd4bf]",
  partial: "bg-zinc-400",
  crowded: "bg-zinc-600",
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-zinc-950/60 p-3">
      <p className="text-sm font-semibold text-white">{value}</p>
      <p className="mt-0.5 text-[10px] text-zinc-600">{label}</p>
    </div>
  );
}

export function IdeaNodeDemo() {
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
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">

          {/* Copy — left 5 cols */}
          <div className="lg:col-span-5">
            <motion.p
              {...fade(0)}
              className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-600"
            >
              Idea validation
            </motion.p>
            <motion.h2
              {...fade(0.07)}
              className="mb-4 text-3xl font-semibold tracking-tight text-white"
            >
              Test your idea against<br />the real market.
            </motion.h2>
            <motion.p {...fade(0.13)} className="mb-6 text-base leading-relaxed text-zinc-500">
              Drop in your concept and Kove checks it against every confirmed gap and pain point in your workspace — in seconds.
            </motion.p>
            <motion.div {...fade(0.2)} className="space-y-3">
              {[
                "Gaps your idea fills — matched to real evidence",
                "Pain points your product solves",
                "Competitors you'll overlap with",
                "Verdict: Strong, Partial, or Crowded",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 text-zinc-600 shrink-0">—</span>
                  <span className="text-sm text-zinc-400">{item}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Idea breakdown panel — right 7 cols */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.16, ease: EASE }}
              className="rounded-2xl border border-white/[0.07] bg-zinc-900 overflow-hidden"
            >
              {/* Header */}
              <div className="border-b border-white/[0.06] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800">
                    <Sparkles className="h-4 w-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Your idea</p>
                    <p className="text-xs text-zinc-400">{IDEA.verdictLabel}</p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* The idea */}
                <div className="rounded-xl border border-white/[0.05] bg-zinc-950/50 p-4">
                  <p className="text-sm leading-relaxed text-zinc-300">{IDEA.text}</p>
                  <div className="mt-2 space-y-0.5 border-t border-white/[0.04] pt-2">
                    <p className="text-[10px] text-zinc-600">
                      <span className="text-zinc-700">For: </span>{IDEA.targetUser}
                    </p>
                    <p className="text-[10px] text-zinc-600">
                      <span className="text-zinc-700">Key edge: </span>{IDEA.keyEdge}
                    </p>
                  </div>
                </div>

                {/* Verdict stats */}
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Verdict</p>
                  <div className="mb-3 grid grid-cols-2 gap-2">
                    <StatCard label="Signal" value={IDEA.verdictLabel} />
                    <StatCard label="Gaps addressed" value={`${IDEA.gapsFilled.filter(g => g.matched).length} / ${IDEA.gapsFilled.length}`} />
                    <StatCard label="Pains solved" value={IDEA.painsSolved.length.toString()} />
                    <StatCard label="Competitor overlaps" value={IDEA.overlaps.length.toString()} />
                  </div>
                  <div className="rounded-xl border border-white/[0.05] bg-zinc-950/50 p-3">
                    <p className="text-sm leading-relaxed text-zinc-400">{IDEA.summary}</p>
                  </div>
                </div>

                {/* Gaps filled */}
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Gaps filled</p>
                  <div className="space-y-2">
                    {IDEA.gapsFilled.map((g, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 8 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.35, delay: 0.5 + i * 0.07, ease: EASE }}
                        className="flex items-start gap-2 rounded-xl border border-white/[0.05] bg-zinc-950/50 p-3"
                      >
                        <span className={`mt-0.5 shrink-0 text-xs font-bold ${g.matched ? "text-[#2dd4bf]" : "text-zinc-700"}`}>
                          {g.matched ? "✓" : "✗"}
                        </span>
                        <p className="text-sm text-zinc-400">{g.gap}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
