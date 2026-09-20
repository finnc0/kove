import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Props {
  href: string;
  title: string;
  description: string;
  stat: string | null;
  statLabel?: string;
  accentColor?: string;
}

export function ToolCard({ href, title, description, stat, statLabel, accentColor = "#2dd4bf" }: Props) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 rounded-xl border border-white/[0.06] bg-zinc-900 p-5 transition-all hover:border-white/[0.14]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
        </div>
        <ArrowRight
          className="mt-0.5 h-4 w-4 shrink-0 text-zinc-700 transition-all group-hover:translate-x-0.5 group-hover:text-zinc-400"
        />
      </div>
      {stat && (
        <p className="text-lg font-semibold tabular-nums" style={{ color: accentColor }}>
          {stat}
          {statLabel && (
            <span className="ml-1.5 text-xs font-normal text-zinc-600">{statLabel}</span>
          )}
        </p>
      )}
    </Link>
  );
}
