"use client";

import { useRouter } from "next/navigation";
import { Search, Smartphone, Layers } from "lucide-react";

const modes = [
  {
    icon: Search,
    title: "Market Research",
    description: "Explore a category, map competitors, and find gaps",
    href: "/new-analysis?mode=market",
  },
  {
    icon: Smartphone,
    title: "App Analysis",
    description: "Paste an App Store or Play Store URL and get a full breakdown",
    href: "/new-analysis?mode=app",
  },
  {
    icon: Layers,
    title: "Full Sweep",
    description: "Combine market research and app analysis in one report",
    href: "/new-analysis?mode=sweep",
  },
];

export function NewAnalysisCard() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {modes.map(({ icon: Icon, title, description, href }) => (
        <div
          key={title}
          onClick={() => router.push(href)}
          className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 cursor-pointer hover:bg-white/[0.04] hover:border-white/[0.1] transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
            <Icon className="w-4 h-4 text-zinc-300" />
          </div>
          <p className="text-sm font-semibold text-white mt-4">{title}</p>
          <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">{description}</p>
        </div>
      ))}
    </div>
  );
}
