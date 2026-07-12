import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { MockReport } from "./mockData";

const signalConfig = {
  Growing:   { className: "bg-green-500/10 text-green-400 border-green-500/20", Icon: TrendingUp },
  Stable:    { className: "bg-white/[0.06] text-zinc-400 border-white/[0.08]",  Icon: Minus },
  Declining: { className: "bg-white/[0.04] text-zinc-400 border-white/[0.08]", Icon: TrendingDown },
};

export function MarketSnapshot({ data }: { data: MockReport["marketSnapshot"] }) {
  const { className, Icon } = signalConfig[data.marketSignal];

  return (
    <section id="market-snapshot" className="mb-14">
      <p className="text-xs font-medium text-zinc-700 uppercase tracking-widest mb-1">01</p>
      <h2 className="text-base font-semibold text-white mb-6">Market Snapshot</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="text-3xl font-bold text-white">{data.competitorsFound}</p>
          <p className="text-xs text-zinc-600 mt-1.5">Competitors found</p>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="text-3xl font-bold text-white">{data.avgRating.toFixed(1)}</p>
          <div className="flex gap-0.5 mt-2 mb-1.5">
            {[1,2,3,4,5].map(i => (
              <div key={i} className={`h-0.5 flex-1 rounded-full ${i <= Math.round(data.avgRating) ? "bg-white/25" : "bg-white/[0.08]"}`} />
            ))}
          </div>
          <p className="text-xs text-zinc-600">Average rating</p>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="text-3xl font-bold text-white">{data.topPlatform}</p>
          <p className="text-xs text-zinc-600 mt-1.5">Top platform</p>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <Badge variant="outline" className={`text-xs flex w-fit items-center gap-1.5 mb-2 ${className}`}>
            <Icon className="w-3 h-3" />{data.marketSignal}
          </Badge>
          <p className="text-xs text-zinc-600">Market signal</p>
        </div>
      </div>

      <p className="text-sm text-zinc-500 leading-relaxed">{data.summary}</p>
    </section>
  );
}
