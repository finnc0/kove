"use client";

import { Link2, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { OFTier } from "./types";

interface Props {
  tiers: OFTier[];
  value: string | null;
  onChange: (tierId: string | null) => void;
}

export function OFPaywallTierLink({ tiers, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = tiers.find((t) => t.id === value);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={[
          "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all",
          value
            ? "border-[#2dd4bf]/30 bg-[#2dd4bf]/[0.06] text-[#2dd4bf]"
            : "border-white/[0.06] bg-zinc-800 text-zinc-500 hover:text-zinc-300",
        ].join(" ")}
      >
        <Link2 className="h-3 w-3" />
        {selected ? selected.name : "Link paywall tier"}
        <ChevronDown className="h-3 w-3 opacity-50" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1.5 min-w-[160px] rounded-lg border border-white/[0.08] bg-zinc-900 py-1 shadow-xl">
          {value && (
            <button
              onClick={() => { onChange(null); setOpen(false); }}
              className="w-full px-3 py-1.5 text-left text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Remove link
            </button>
          )}
          {tiers.length === 0 && (
            <p className="px-3 py-2 text-xs text-zinc-600">No tiers yet — add them in Paywall Structurer</p>
          )}
          {tiers.map((tier) => (
            <button
              key={tier.id}
              onClick={() => { onChange(tier.id); setOpen(false); }}
              className={[
                "w-full px-3 py-1.5 text-left text-xs transition-colors",
                tier.id === value ? "text-[#2dd4bf]" : "text-zinc-400 hover:text-white",
              ].join(" ")}
            >
              {tier.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
