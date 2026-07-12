"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { APPS } from "../landing/sampleMarket";

const W = 520;
const H = 330;
const EASE = [0.22, 1, 0.36, 1] as const;

const NODES = [
  { ...APPS[0], x: 138, y: 105 },
  { ...APPS[1], x: 392, y: 88 },
  { ...APPS[2], x: 412, y: 252 },
  { ...APPS[3], x: 115, y: 258 },
];

const QUAD_LINES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
];

const GAP = { x: 268, y: 178 };


export function HeroCanvas() {
  const [phase, setPhase] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setPhase(4);
      return;
    }
    const ts = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(4), 2750),
    ];
    return () => ts.forEach(clearTimeout);
  }, [reduced]);

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/70 shadow-2xl shadow-black/60 backdrop-blur-sm">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-white/[0.07]" />
        <span className="h-2 w-2 rounded-full bg-white/[0.07]" />
        <span className="h-2 w-2 rounded-full bg-white/[0.07]" />
        <span className="ml-3 text-[11px] text-zinc-600">
          AI note-taking apps · 4 competitors
        </span>
      </div>

      {/* SVG canvas */}
      <div
        className="relative w-full"
        style={{ paddingBottom: `${(H / W) * 100}%` }}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="absolute inset-0 h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Quadrilateral connector lines */}
          {QUAD_LINES.map(([a, b], i) => {
            const n1 = NODES[a], n2 = NODES[b];
            const len = Math.hypot(n2.x - n1.x, n2.y - n1.y);
            return (
              <motion.line
                key={`ql${i}`}
                x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
                strokeDasharray={len}
                initial={{ strokeDashoffset: len }}
                animate={{ strokeDashoffset: phase >= 2 ? 0 : len }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: "easeInOut" }}
              />
            );
          })}

          {/* Gap connector lines */}
          {phase >= 3 &&
            NODES.map((node, i) => (
              <motion.line
                key={`gc${i}`}
                x1={node.x} y1={node.y} x2={GAP.x} y2={GAP.y}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="0.75"
                strokeDasharray="4 4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              />
            ))}

          {/* Node cards */}
          {NODES.map((node, i) => {
            const cw = 116, ch = 58;
            const x = node.x - cw / 2, y = node.y - ch / 2;
            return (
              <motion.g
                key={node.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: phase >= 1 ? 1 : 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <rect
                  x={x} y={y} width={cw} height={ch} rx={7}
                  fill="rgba(24,24,27,0.97)"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth={0.75}
                />
                <text
                  x={x + 11} y={y + 17}
                  fill="rgba(255,255,255,0.8)" fontSize={9}
                  fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
                  fontWeight="600"
                >
                  {node.name}
                </text>
                <text
                  x={x + 11} y={y + 30}
                  fill="rgba(255,255,255,0.28)" fontSize={7}
                  fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
                >
                  ★ {node.rating}
                </text>
                <text
                  x={x + 11} y={y + 46}
                  fill="rgba(255,255,255,0.22)" fontSize={6.5}
                  fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
                >
                  {node.downloadsLabel}
                </text>
              </motion.g>
            );
          })}

          {/* Gap marker */}
          {phase >= 4 && (
            <motion.g
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: EASE }}
              style={{ transformOrigin: `${GAP.x}px ${GAP.y}px` }}
            >
              <circle cx={GAP.x} cy={GAP.y} r={7} fill="rgba(255,255,255,0.05)" />
              <circle cx={GAP.x} cy={GAP.y} r={3.5} fill="rgba(255,255,255,0.7)" />
              <rect
                x={GAP.x - 40} y={GAP.y + 10} width={80} height={16} rx={4}
                fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.5}
              />
              <text
                x={GAP.x} y={GAP.y + 21}
                textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={6.5}
                fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
                fontWeight="700" letterSpacing={1.2}
              >
                GAP IDENTIFIED
              </text>
            </motion.g>
          )}
        </svg>
      </div>
    </div>
  );
}
