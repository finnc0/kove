"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "market-snapshot",    label: "Market Snapshot" },
  { id: "competitor-map",     label: "Competitors" },
  { id: "pricing",            label: "Pricing" },
  { id: "pain-points",        label: "Pain Points" },
  { id: "gap-analysis",       label: "Gap Analysis" },
  { id: "opportunity-scores", label: "Opportunities" },
  { id: "positioning",        label: "Positioning" },
];

export function SectionNav() {
  const [active, setActive] = useState("market-snapshot");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { rootMargin: "-20% 0px -65% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <nav className="flex overflow-x-auto border-b border-white/[0.08] mb-10 bg-zinc-950">
      {SECTIONS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
          className={`shrink-0 px-4 py-3 text-sm whitespace-nowrap transition-colors border-b-2 -mb-px ${
            active === id
              ? "border-white text-white font-medium"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
