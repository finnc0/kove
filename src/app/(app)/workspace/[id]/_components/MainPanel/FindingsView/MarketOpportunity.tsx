import { Lightbulb, Lock, Plus } from "lucide-react";

interface Props {
  completedCount: number;
  onAddNode: () => void;
}

export function MarketOpportunity({ completedCount, onAddNode }: Props) {
  const locked = completedCount < 3;

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-white">Market Opportunity</h2>
      </div>

      <div className="relative">
        <div className="bg-zinc-900 border border-white/[0.06] rounded-xl p-8">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-zinc-500" />
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
              Market Opportunity
            </span>
          </div>

          <p className="text-xl font-semibold text-white mt-4 leading-snug">
            Build the sync-reliable, offline-first note app mobile professionals actually trust
          </p>
          <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
            Every major player fails on mobile reliability. Sync conflicts, slow load times, and offline limitations are the top 3 churn drivers across 4 analyzed apps — yet none has made reliability a core product promise.
          </p>

          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { label: "Positioning", value: "Sync-reliable mobile-first notes" },
              { label: "Target ICP", value: "On-the-go knowledge workers & founders" },
              { label: "Feature Bet", value: "CRDT sync + true offline + fast load" },
            ].map((card) => (
              <div key={card.label} className="bg-zinc-800 rounded-lg p-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wide">{card.label}</p>
                <p className="text-sm text-white font-medium mt-2">{card.value}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-zinc-600 mt-6">
            Based on analysis of {completedCount} apps. Add more apps to strengthen this recommendation.
          </p>
        </div>

        {locked && (
          <div className="absolute inset-0 backdrop-blur-sm bg-zinc-950/80 rounded-xl flex flex-col items-center justify-center gap-3">
            <Lock className="w-5 h-5 text-zinc-500" />
            <p className="text-sm text-zinc-400 text-center max-w-xs leading-relaxed">
              Analyze 3 or more apps to unlock market opportunity insights
            </p>
            <button
              onClick={onAddNode}
              className="flex items-center gap-1.5 text-xs font-medium text-white border border-white/20 rounded-lg px-4 py-2 hover:bg-white/[0.06] transition-colors mt-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add apps
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
