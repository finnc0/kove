"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const W = 520;
const H = 330;
const EASE = [0.22, 1, 0.36, 1] as const;

const NODES = [
  {
    id: "n1",
    x: 138,
    y: 92,
    name: "Notion AI",
    rating: 4.6,
    pain: 3,
    revenue: "$450k",
    dl: "68k",
    color: "#8b5cf6",
  },
  {
    id: "n2",
    x: 378,
    y: 78,
    name: "Obsidian",
    rating: 4.8,
    pain: 4,
    revenue: "$180k",
    dl: "32k",
    color: "#3b82f6",
  },
  {
    id: "n3",
    x: 352,
    y: 238,
    name: "Craft",
    rating: 4.7,
    pain: 2,
    revenue: "$95k",
    dl: "18k",
    color: "#f472b6",
  },
];

const LINES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 0],
];
const GAP = { x: 165, y: 208 };
const N_DOTS = 4;

function PainDots({
  filled,
  startX,
  y,
  color,
}: {
  filled: number;
  startX: number;
  y: number;
  color: string;
}) {
  return (
    <>
      {Array.from({ length: N_DOTS }).map((_, i) => (
        <circle
          key={i}
          cx={startX + i * 6.5}
          cy={y}
          r={2.2}
          fill={i < filled ? color : "rgba(255,255,255,0.1)"}
        />
      ))}
    </>
  );
}

export function MiniCanvas() {
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
          AI note-taking apps · 3 competitors
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
          {/* Connector lines */}
          {LINES.map(([a, b], i) => {
            const n1 = NODES[a],
              n2 = NODES[b];
            const len = Math.hypot(n2.x - n1.x, n2.y - n1.y);
            return (
              <motion.line
                key={`l${i}`}
                x1={n1.x}
                y1={n1.y}
                x2={n2.x}
                y2={n2.y}
                stroke="rgba(255,255,255,0.07)"
                strokeWidth="1"
                strokeDasharray={len}
                initial={{ strokeDashoffset: len }}
                animate={{ strokeDashoffset: phase >= 2 ? 0 : len }}
                transition={{ duration: 0.7, delay: i * 0.14, ease: "easeInOut" }}
              />
            );
          })}

          {/* Gap dashed connector */}
          {phase >= 4 && (
            <motion.line
              x1={NODES[0].x}
              y1={NODES[0].y}
              x2={GAP.x}
              y2={GAP.y}
              stroke="#2dd4bf"
              strokeWidth="1"
              strokeOpacity="0.35"
              strokeDasharray="4 4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}

          {/* Node cards */}
          {NODES.map((node, i) => {
            const cw = 112,
              ch = 54;
            const x = node.x - cw / 2,
              y = node.y - ch / 2;
            return (
              <motion.g
                key={node.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: phase >= 1 ? 1 : 0 }}
                transition={{ duration: 0.4, delay: i * 0.12 }}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={30}
                  fill={node.color}
                  opacity={0.04}
                />
                <rect
                  x={x}
                  y={y}
                  width={cw}
                  height={ch}
                  rx={7}
                  fill="rgba(24,24,27,0.97)"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth={0.75}
                />
                <circle
                  cx={x + 11}
                  cy={y + 14}
                  r={3.5}
                  fill={node.color}
                  opacity={0.85}
                />
                <text
                  x={x + 21}
                  y={y + 18}
                  fill="rgba(255,255,255,0.8)"
                  fontSize={9}
                  fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
                  fontWeight="600"
                >
                  {node.name}
                </text>
                <text
                  x={x + 11}
                  y={y + 30}
                  fill="rgba(255,255,255,0.28)"
                  fontSize={7}
                  fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
                >
                  ★ {node.rating}
                </text>
                <PainDots
                  filled={node.pain}
                  startX={x + 11}
                  y={y + 42}
                  color={node.color}
                />
                <text
                  x={x + 42}
                  y={y + 44}
                  fill="rgba(255,255,255,0.25)"
                  fontSize={6.5}
                  fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
                >
                  {node.revenue} · {node.dl} dl
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
              <motion.circle
                cx={GAP.x}
                cy={GAP.y}
                r={16}
                fill="none"
                stroke="#2dd4bf"
                strokeWidth={0.75}
                animate={{ r: [16, 34], opacity: [0.4, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
              />
              <circle
                cx={GAP.x}
                cy={GAP.y}
                r={7}
                fill="#2dd4bf"
                opacity={0.1}
              />
              <circle cx={GAP.x} cy={GAP.y} r={3.5} fill="#2dd4bf" />
              <rect
                x={GAP.x - 38}
                y={GAP.y + 10}
                width={76}
                height={15}
                rx={4}
                fill="rgba(45,212,191,0.08)"
                stroke="rgba(45,212,191,0.2)"
                strokeWidth={0.5}
              />
              <text
                x={GAP.x}
                y={GAP.y + 20}
                textAnchor="middle"
                fill="#2dd4bf"
                fontSize={6.5}
                fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
                fontWeight="700"
                letterSpacing={1.2}
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
