interface Tier {
  name: string;
  price: string;
  period: string;
  features: string[];
  isPopular?: boolean;
}

export function PricingTiers({
  pricingModel,
  tiers,
}: {
  pricingModel: string;
  tiers: Tier[];
}) {
  return (
    <div className="mb-5 rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Pricing</h3>
        <span className="rounded-full border border-white/[0.06] bg-zinc-800/60 px-2 py-0.5 text-[10px] text-zinc-500">
          {pricingModel}
        </span>
      </div>

      {tiers.length === 0 ? (
        <p className="text-sm text-zinc-600">No tier data available.</p>
      ) : (
        <div className="space-y-2">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={[
                "rounded-lg border px-4 py-3",
                tier.isPopular
                  ? "border-[#2dd4bf]/20 bg-[#2dd4bf]/[0.04]"
                  : "border-white/[0.05] bg-zinc-800/40",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white">{tier.name}</p>
                  {tier.isPopular && (
                    <span className="rounded-full bg-[#2dd4bf]/15 px-1.5 py-px text-[10px] font-medium text-[#2dd4bf]">
                      Popular
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-zinc-200">
                    {tier.price}
                  </p>
                  <p className="text-[10px] text-zinc-600">{tier.period}</p>
                </div>
              </div>
              {tier.features?.length > 0 && (
                <ul className="mt-2 space-y-0.5">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-1.5 text-xs text-zinc-500">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-zinc-700" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
