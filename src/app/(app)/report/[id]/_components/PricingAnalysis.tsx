import type { PricingData, PriceTier } from "./mockData";

const MAX_PRICE = 20;

function formatPrice(tier: PriceTier): string {
  if (tier.price === 0) return "Free";
  if (tier.period === "year")     return `$${tier.price}/yr`;
  if (tier.period === "lifetime") return `$${tier.price} once`;
  if (tier.period === "one-time") return `$${tier.price}`;
  return `$${tier.price}/mo`;
}

function TierChip({ tier }: { tier: PriceTier }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border",
        tier.price === 0
          ? "border-white/[0.06] bg-white/[0.03] text-zinc-400"
          : tier.isPopular
          ? "border-white/[0.14] bg-white/[0.07] text-white"
          : "border-white/[0.06] bg-white/[0.02] text-zinc-400",
      ].join(" ")}
    >
      <span>{tier.name}</span>
      <span className={tier.price === 0 ? "text-zinc-600" : "text-zinc-500"}>
        {formatPrice(tier)}
      </span>
      {tier.isPopular && (
        <span className="text-[10px] text-zinc-500 ml-0.5">★</span>
      )}
    </span>
  );
}

function PriceBar({ price, max = MAX_PRICE }: { price: number; max?: number }) {
  const pct = Math.min((price / max) * 100, 100);
  return (
    <div className="flex-1 h-0.5 bg-white/[0.06] rounded-full relative overflow-visible">
      <div
        className="absolute h-1.5 -top-[3px] left-0 rounded-full bg-white/20"
        style={{ width: `${pct}%` }}
      />
      <div
        className="absolute top-1/2 w-1.5 h-1.5 rounded-full bg-white/60"
        style={{ left: `${pct}%`, transform: "translate(-50%, -50%)" }}
      />
    </div>
  );
}

export function PricingAnalysis({ data }: { data: PricingData }) {
  const pricing = data.competitorPricing ?? [];
  const breakdown = data.modelBreakdown ?? [];
  const maxBar = Math.max(...pricing.map(c => c.startingPrice), MAX_PRICE);

  return (
    <section id="pricing" className="mb-14">
      <p className="text-xs font-medium text-zinc-700 uppercase tracking-widest mb-1">03</p>
      <h2 className="text-base font-semibold text-white mb-6">Pricing & Monetization</h2>

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="text-3xl font-bold text-white">
            ${data.avgPaidPrice.toFixed(0)}
            <span className="text-base font-normal text-zinc-600">/mo</span>
          </p>
          <p className="text-xs text-zinc-600 mt-1.5">Avg paid price</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="text-3xl font-bold text-white">
            {pricing.length
              ? Math.round((pricing.filter(c => c.hasFree).length / pricing.length) * 100)
              : 0}
            <span className="text-base font-normal text-zinc-600">%</span>
          </p>
          <p className="text-xs text-zinc-600 mt-1.5">Offer free tier</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="text-2xl font-bold text-white truncate">
            {breakdown[0]?.model ?? "—"}
          </p>
          <p className="text-xs text-zinc-600 mt-1.5">Dominant model</p>
        </div>
      </div>

      {/* Tier comparison table */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 mb-3">
        <p className="text-xs font-medium text-zinc-600 mb-4">All pricing tiers by competitor</p>
        <div className="space-y-3">
          {pricing.map(c => (
            <div key={c.name} className="flex items-start gap-4">
              <span className="text-xs text-zinc-400 w-24 shrink-0 truncate pt-1">{c.name}</span>
              <div className="flex flex-wrap gap-1.5">
                {(c.tiers ?? []).map(t => (
                  <TierChip key={t.name} tier={t} />
                ))}
                {(!c.tiers || c.tiers.length === 0) && (
                  <span className="text-xs text-zinc-600 pt-1">
                    {c.hasFree ? "Free" : `$${c.startingPrice}/${c.period}`}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-zinc-700 mt-4 pt-3 border-t border-white/[0.04]">
          ★ marks the most commonly highlighted or popular tier
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {/* Price distribution */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <p className="text-xs font-medium text-zinc-600 mb-4">Starting price distribution</p>
          <div className="space-y-3.5">
            {[...pricing]
              .sort((a, b) => a.startingPrice - b.startingPrice)
              .map(c => (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="text-xs text-zinc-400 w-20 shrink-0 truncate">{c.name}</span>
                  <PriceBar price={c.startingPrice} max={maxBar} />
                  <span className="text-xs text-zinc-600 w-14 shrink-0 tabular-nums text-right">
                    {c.startingPrice === 0 ? "Free" : `$${c.startingPrice}/mo`}
                  </span>
                </div>
              ))}
          </div>
          <div className="flex justify-between mt-4 pt-3 border-t border-white/[0.04]">
            <span className="text-xs text-zinc-700">$0</span>
            <span className="text-xs text-zinc-700">${maxBar}/mo</span>
          </div>
        </div>

        {/* Model breakdown */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <p className="text-xs font-medium text-zinc-600 mb-4">Model breakdown</p>
          <div className="space-y-3.5">
            {breakdown.map(m => (
              <div key={m.model}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-zinc-400">{m.model}</span>
                  <span className="text-xs text-zinc-600 tabular-nums">
                    {m.count} of {pricing.length}
                  </span>
                </div>
                <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full bg-white/30 rounded-full" style={{ width: `${m.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed mt-5 pt-4 border-t border-white/[0.04]">
            {data.summary}
          </p>
        </div>
      </div>

      {/* Recommendation */}
      {data.recommendation && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
          <div className="mb-4">
            <p className="text-xs text-zinc-600 mb-1">Recommended strategy</p>
            <p className="text-base font-semibold text-white">
              {data.recommendation.model} · {data.recommendation.price}
            </p>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed mb-4">{data.recommendation.rationale}</p>
          <div className="space-y-2">
            {(data.recommendation.considerations ?? []).map((c, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-zinc-600 shrink-0 mt-1.5" />
                <span className="text-xs text-zinc-500 leading-relaxed">{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
