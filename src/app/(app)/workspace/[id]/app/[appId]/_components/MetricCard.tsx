"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { EstTag } from "./EstTag";

function formatNum(n: number, prefix = ""): string {
  if (n >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${prefix}${Math.round(n / 1_000)}K`;
  return `${prefix}${n}`;
}

function useCountUp(target: number, duration = 750): number {
  const reduced = useReducedMotion();
  const [val, setVal] = useState(reduced ? target : 0);

  useEffect(() => {
    if (reduced) { setVal(target); return; }
    if (target === 0) { setVal(0); return; }
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / duration, 1);
      const eased = t * t * (3 - 2 * t);
      setVal(Math.floor(eased * target));
      if (t < 1) requestAnimationFrame(step);
      else setVal(target);
    };
    requestAnimationFrame(step);
  }, [target, duration, reduced]);

  return val;
}

interface Props {
  label: string;
  value: number;
  prefix?: string;
  isEstimate?: boolean;
  range?: string;
  secondary?: string;
  highlight?: boolean;
  ratingMode?: boolean;
}

export function MetricCard({
  label,
  value,
  prefix = "",
  isEstimate = false,
  range,
  secondary,
  highlight = false,
  ratingMode = false,
}: Props) {
  const animated = useCountUp(value);
  const hasValue = value > 0;

  const displayValue = ratingMode
    ? `${(animated / 10).toFixed(1)}`
    : (hasValue ? formatNum(animated, prefix) : "—");

  return (
    <div
      className={[
        "flex flex-col gap-1 rounded-xl border p-5 transition-colors",
        highlight
          ? "border-[#2dd4bf]/20 bg-[#2dd4bf]/[0.04]"
          : "border-white/[0.06] bg-zinc-900 hover:border-white/[0.12]",
      ].join(" ")}
    >
      <div className="flex items-baseline gap-1.5">
        <p
          className={[
            "text-3xl font-bold tracking-tight tabular-nums",
            highlight ? "text-[#2dd4bf]" : "text-white",
            !hasValue && "text-zinc-700",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {ratingMode && hasValue ? (
            <>
              {displayValue}
              <span className="ml-0.5 text-xl font-medium text-zinc-600">/5</span>
            </>
          ) : displayValue}
        </p>
        {isEstimate && hasValue && <EstTag />}
      </div>

      <p className="text-xs font-medium text-zinc-500">{label}</p>

      {range && hasValue && (
        <p className="mt-0.5 text-[10px] text-zinc-700 tabular-nums">{range}</p>
      )}
      {secondary && (
        <p className="mt-0.5 text-[10px] text-zinc-600">{secondary}</p>
      )}
    </div>
  );
}
