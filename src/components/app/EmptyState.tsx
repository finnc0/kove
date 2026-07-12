"use client";

import Link from "next/link";
import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  heading: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
}

export function EmptyState({ icon: Icon, heading, subtext, ctaLabel, ctaHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-16">
      <Icon className="w-10 h-10 text-zinc-700 mx-auto" />
      <p className="text-sm font-medium text-white mt-4 text-center">{heading}</p>
      <p className="text-xs text-zinc-500 text-center mt-1">{subtext}</p>
      <Link
        href={ctaHref}
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-100 transition-colors"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
