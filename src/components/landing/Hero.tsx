"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const W = 520;
const H = 340;

const NODES = [
  { id: "n1", x: 104,  y: 82,  name: "Habitica",  rating: 4.3, color: "#8b5cf6" },
  { id: "n2", x: 390,  y: 68,  name: "Streaks",   rating: 4.8, color: "#3b82f6" },
  { id: "n3", x: 418,  y: 238, name: "Finch",     rating: 4.7, color: "#f472b6" },
  { id: "n4", x: 94,   y: 264, name: "Bearable",  rating: 4.2, color: "#fb923c" },
];

const LINES: [number, number][] = [[0,1],[1,2],[2,3],[3,0],[1,3]];

const CHIPS = [
  { x: 244, y: 38,  label: "$3.2M / yr" },
  { x: 476, y: 162, label: "★ 4.5 avg"  },
  { x: 42,  y: 175, label: "48K / mo"   },
];

const GAP = { x: 248, y: 178 };

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Hero() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const ts = [
      setTimeout(() => setPhase(1), 350),
      setTimeout(() => setPhase(2), 850),
      setTimeout(() => setPhase(3), 1700),
      setTimeout(() => setPhase(4), 2600),
    ];
    return () => ts.forEach(clearTimeout);
  }, []);

  return (
    <section className="relative min-h-[calc(100vh-56px)] flex items-center overflow-hidden">
      {/* Dot grid — scoped to hero only */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          WebkitMaskImage: "radial-gradient(ellipse 85% 85% at 50% 50%, black 20%, transparent 100%)",
          maskImage:       "radial-gradient(ellipse 85% 85% at 50% 50%, black 20%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1100px] px-6 py-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* ── Text ── */}
          <div className="flex-1 min-w-0 max-w-[480px]">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4bf]" />
              <span className="text-xs font-medium text-zinc-400">For startup founders</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
              className="font-bold tracking-tight text-white leading-[1.06] mb-5"
              style={{ fontSize: "clamp(2.4rem, 4vw, 3.4rem)" }}
            >
              Find the gap<br />
              <span className="text-zinc-500">before you build.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.28, ease: EASE }}
              className="text-base text-zinc-500 leading-relaxed mb-8"
            >
              Map competitors, surface what users actually complain about, and
              identify the exact gap worth building — powered by live app store
              data and AI.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.4 }}
              className="flex flex-wrap items-center gap-3"
            >
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-100 transition-colors"
              >
                Analyze a market free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-xs text-zinc-600">No credit card · 30 seconds to set up</p>
            </motion.div>
          </div>

          {/* ── Canvas ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex-1 w-full min-w-0"
          >
            <div className="w-full rounded-2xl border border-white/[0.08] bg-zinc-900/70 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/60">
              {/* Toolbar chrome */}
              <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-white/[0.08]" />
                <span className="h-2 w-2 rounded-full bg-white/[0.08]" />
                <span className="h-2 w-2 rounded-full bg-white/[0.08]" />
                <span className="ml-3 text-[11px] text-zinc-600">Habit tracker market · 4 apps analyzed</span>
              </div>

              {/* SVG canvas — aspect-ratio matches H/W */}
              <div className="relative w-full" style={{ paddingBottom: `${(H / W) * 100}%` }}>
                <svg
                  viewBox={`0 0 ${W} ${H}`}
                  className="absolute inset-0 w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Connector lines */}
                  {LINES.map(([a, b], i) => {
                    const n1 = NODES[a], n2 = NODES[b];
                    const len = Math.hypot(n2.x - n1.x, n2.y - n1.y);
                    return (
                      <motion.line
                        key={`l${i}`}
                        x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y}
                        stroke="rgba(255,255,255,0.07)"
                        strokeWidth="1"
                        strokeDasharray={len}
                        initial={{ strokeDashoffset: len }}
                        animate={{ strokeDashoffset: phase >= 2 ? 0 : len }}
                        transition={{ duration: 0.7, delay: i * 0.12, ease: "easeInOut" }}
                      />
                    );
                  })}

                  {/* Nodes */}
                  {NODES.map((node, i) => (
                    <motion.g
                      key={node.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: phase >= 1 ? 1 : 0 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                    >
                      <circle cx={node.x} cy={node.y} r={26} fill={node.color} opacity={0.06} />
                      <rect
                        x={node.x - 42} y={node.y - 20}
                        width={84} height={40} rx={6}
                        fill="rgba(24,24,27,0.96)"
                        stroke="rgba(255,255,255,0.09)"
                        strokeWidth={0.75}
                      />
                      <circle cx={node.x - 28} cy={node.y - 4} r={3} fill={node.color} opacity={0.85} />
                      <text
                        x={node.x - 20} y={node.y}
                        fill="rgba(255,255,255,0.8)"
                        fontSize={8.5}
                        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                        fontWeight="600"
                      >{node.name}</text>
                      <text
                        x={node.x - 28} y={node.y + 11}
                        fill="rgba(255,255,255,0.3)"
                        fontSize={7}
                        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                      >★ {node.rating} · iOS</text>
                    </motion.g>
                  ))}

                  {/* Data chips */}
                  {CHIPS.map((chip, i) => (
                    <motion.g
                      key={`c${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: phase >= 3 ? 0.85 : 0 }}
                      transition={{ duration: 0.35, delay: i * 0.14 }}
                    >
                      <rect
                        x={chip.x - 30} y={chip.y - 9}
                        width={60} height={17} rx={4}
                        fill="rgba(255,255,255,0.03)"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth={0.5}
                      />
                      <text
                        x={chip.x} y={chip.y + 2.5}
                        textAnchor="middle"
                        fill="rgba(255,255,255,0.4)"
                        fontSize={7}
                        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                        fontWeight="500"
                      >{chip.label}</text>
                    </motion.g>
                  ))}

                  {/* Gap marker */}
                  {phase >= 4 && (
                    <motion.g
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, ease: EASE }}
                      style={{ transformOrigin: `${GAP.x}px ${GAP.y}px` }}
                    >
                      <motion.circle
                        cx={GAP.x} cy={GAP.y} r={18}
                        fill="none" stroke="#2dd4bf" strokeWidth={1}
                        animate={{ r: [18, 36], opacity: [0.35, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                      />
                      <circle cx={GAP.x} cy={GAP.y} r={8}  fill="#2dd4bf" opacity={0.12} />
                      <circle cx={GAP.x} cy={GAP.y} r={4}  fill="#2dd4bf" />
                      <rect
                        x={GAP.x - 36} y={GAP.y + 12}
                        width={72} height={16} rx={4}
                        fill="rgba(45,212,191,0.1)"
                        stroke="rgba(45,212,191,0.22)"
                        strokeWidth={0.5}
                      />
                      <text
                        x={GAP.x} y={GAP.y + 23}
                        textAnchor="middle"
                        fill="#2dd4bf"
                        fontSize={6.5}
                        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                        fontWeight="700"
                        letterSpacing={1.2}
                      >GAP IDENTIFIED</text>
                    </motion.g>
                  )}
                </svg>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
