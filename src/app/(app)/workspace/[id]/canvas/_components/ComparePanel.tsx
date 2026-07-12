"use client";

import { X, Star, TrendingUp, DollarSign, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import type { CanvasAppNode } from "./types";

interface Props {
  nodes: CanvasAppNode[];
  onClose: () => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n > 0 ? n.toString() : "—";
}

function SeverityDot({ s }: { s: "High" | "Medium" | "Low" | null }) {
  if (!s) return <span className="text-zinc-700">—</span>;
  const color = s === "High" ? "bg-zinc-300" : s === "Medium" ? "bg-zinc-500" : "bg-zinc-700";
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      <span className="text-zinc-400">{s}</span>
    </span>
  );
}

function Cell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex min-h-[36px] items-center px-3 py-2 text-sm ${className}`}>
      {children}
    </div>
  );
}

const ROWS: { label: string; icon: React.ReactNode; key: keyof CanvasAppNode | "topPain" }[] = [
  { label: "Rating",      icon: <Star className="h-3 w-3" />,          key: "rating" },
  { label: "Downloads",   icon: <TrendingUp className="h-3 w-3" />,    key: "downloadsFormatted" },
  { label: "Revenue",     icon: <DollarSign className="h-3 w-3" />,    key: "revenueFormatted" },
  { label: "Entry price", icon: <DollarSign className="h-3 w-3" />,    key: "primaryPrice" },
  { label: "Top pain",    icon: <AlertTriangle className="h-3 w-3" />, key: "topPain" },
];

function renderValue(node: CanvasAppNode, key: string): React.ReactNode {
  if (key === "topPain") {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-zinc-300 leading-snug line-clamp-2">{node.topPainTitle ?? "—"}</span>
        {node.topPainSeverity && <SeverityDot s={node.topPainSeverity} />}
      </div>
    );
  }
  if (key === "rating") {
    return node.rating != null ? (
      <span className="flex items-center gap-1">
        <Star className="h-3 w-3 fill-zinc-400 text-zinc-400" />
        <span className="text-zinc-200">{node.rating.toFixed(1)}</span>
      </span>
    ) : <span className="text-zinc-700">—</span>;
  }
  if (key === "downloadsFormatted") return <span className="text-zinc-200">{node.rawDownloads > 0 ? fmt(node.rawDownloads) : "—"}</span>;
  if (key === "revenueFormatted")  return <span className="text-zinc-200">{node.rawRevenue > 0 ? `$${fmt(node.rawRevenue)}/mo` : "—"}</span>;
  if (key === "primaryPrice")      return <span className="text-zinc-200">{(node.primaryPrice ?? "Free")}</span>;
  return <span className="text-zinc-500">—</span>;
}

// Find the "best" node per row (highest rating, downloads, revenue)
function getBestId(nodes: CanvasAppNode[], key: string): string | null {
  if (key === "rating")             return nodes.reduce((a, b) => (b.rating ?? 0) > (a.rating ?? 0) ? b : a, nodes[0])?.id ?? null;
  if (key === "downloadsFormatted") return nodes.reduce((a, b) => b.rawDownloads > a.rawDownloads ? b : a, nodes[0])?.id ?? null;
  if (key === "revenueFormatted")   return nodes.reduce((a, b) => b.rawRevenue > a.rawRevenue ? b : a, nodes[0])?.id ?? null;
  return null;
}

export function ComparePanel({ nodes, onClose }: Props) {
  if (nodes.length === 0) return null;

  const colW = Math.min(200, Math.floor(560 / nodes.length));
  const panelW = 160 + colW * nodes.length + 32; // label col + data cols + padding

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.22, ease: EASE }}
      className="absolute right-3 top-3 z-20 overflow-hidden rounded-2xl border border-white/[0.07] bg-zinc-900/95 shadow-2xl backdrop-blur-md"
      style={{ width: panelW, maxWidth: "calc(100vw - 100px)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Compare</span>
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-white/[0.06] hover:text-zinc-300"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: panelW - 32 }}>
          {/* App header row */}
          <thead>
            <tr>
              <th className="w-36 border-b border-white/[0.05] px-3 py-3" />
              {nodes.map((n) => (
                <th
                  key={n.id}
                  className="border-b border-white/[0.05] px-3 py-3 text-left"
                  style={{ width: colW }}
                >
                  <div className="flex items-center gap-2">
                    {n.iconUrl ? (
                      <img src={n.iconUrl} alt="" className="h-7 w-7 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-[10px] font-bold text-zinc-500">
                        {n.name[0]}
                      </span>
                    )}
                    <span className="truncate text-xs font-medium text-zinc-200">{n.name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Data rows */}
          <tbody>
            {ROWS.map(({ label, icon, key }, rowIdx) => {
              const bestId = getBestId(nodes, key as string);
              return (
                <tr key={key as string} className={rowIdx % 2 === 0 ? "bg-white/[0.01]" : ""}>
                  {/* Label */}
                  <td className="border-b border-white/[0.04] px-3 py-2">
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-600">
                      {icon}
                      {label}
                    </span>
                  </td>
                  {/* Values */}
                  {nodes.map((n) => (
                    <td
                      key={n.id}
                      className={`border-b border-white/[0.04] ${bestId === n.id ? "bg-[#2dd4bf]/[0.05]" : ""}`}
                    >
                      <Cell className={bestId === n.id ? "text-[#2dd4bf]" : ""}>
                        {renderValue(n, key as string)}
                      </Cell>
                    </td>
                  ))}
                </tr>
              );
            })}

            {/* Strengths row */}
            <tr>
              <td className="px-3 py-2 align-top">
                <span className="text-[11px] font-medium text-zinc-600">Strengths</span>
              </td>
              {nodes.map((n) => {
                const strengths = n.report?.aiSynthesis?.doesWell ?? null;
                return (
                  <td key={n.id} className="px-3 py-2 align-top">
                    <p className="text-[11px] leading-relaxed text-zinc-500 line-clamp-3">
                      {strengths ?? "—"}
                    </p>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Hint */}
      <div className="border-t border-white/[0.05] px-4 py-2.5">
        <p className="text-[10px] text-zinc-700">
          Teal highlight = best in category · Click nodes on canvas to add/remove
        </p>
      </div>
    </motion.div>
  );
}
