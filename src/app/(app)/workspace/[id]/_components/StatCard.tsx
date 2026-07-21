"use client";

import { useEffect, useState } from "react";

interface Props {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  estimate?: boolean;
  placeholder?: string;
  decimals?: number;
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toString();
}

function useCountUp(target: number, duration = 700): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === 0) {
      setVal(0);
      return;
    }
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / duration, 1);
      const eased = t * t * (3 - 2 * t); // smoothstep
      setVal(Math.floor(eased * target));
      if (t < 1) requestAnimationFrame(step);
      else setVal(target);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
}

export function StatCard({
  value,
  label,
  prefix = "",
  suffix = "",
  estimate = false,
  placeholder,
  decimals,
}: Props) {
  const animated = useCountUp(value);

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
      {value > 0 ? (
        <p className="text-3xl font-bold tracking-tight text-white tabular-nums">
          {prefix}
          {decimals !== undefined ? animated.toFixed(decimals) : formatNum(animated)}
          {suffix}
        </p>
      ) : (
        <p className="text-2xl font-bold tracking-tight text-zinc-700">
          {placeholder ?? "—"}
        </p>
      )}
      <div className="flex items-center gap-1.5">
        <p className="text-xs text-zinc-500">{label}</p>
        {estimate && value > 0 && (
          <span className="text-[10px] text-zinc-700">est.</span>
        )}
      </div>
    </div>
  );
}
