import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";

interface Props {
  workspaceId: string;
  competitorCount: number;
  children: React.ReactNode;
}

export function MarketSignalsGuard({ workspaceId, competitorCount, children }: Props) {
  if (competitorCount < 3) {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-5">
        <div className="mb-4 flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500/70" />
          <div>
            <p className="text-sm font-medium text-zinc-300">
              Market signals need at least 3 competitors to be reliable.
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              You have {competitorCount} — add {3 - competitorCount} more to unlock gap-derived
              suggestions.
            </p>
          </div>
        </div>
        <Link
          href={`/workspace/${workspaceId}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:border-white/[0.16] hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to market home
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
