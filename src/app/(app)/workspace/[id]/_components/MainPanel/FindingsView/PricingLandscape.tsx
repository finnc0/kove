import type { FindingsPricingRow } from "@/app/api/workspaces/[id]/findings/route";

export function PricingLandscape({ pricing }: { pricing: FindingsPricingRow[] }) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-white">Pricing Landscape</h2>
        <span className="text-xs text-zinc-600">{pricing.length} apps</span>
      </div>
      <div className="rounded-xl border border-white/[0.06] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["App", "Model", "Entry", "Top"].map((h) => (
                <th key={h} className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wide px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pricing.map((row, i) => (
              <tr key={i} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {row.appIcon && (
                      <img src={row.appIcon} alt="" className="w-5 h-5 rounded-md object-cover shrink-0" />
                    )}
                    <span className="text-sm font-medium text-white">{row.app}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500">{row.model}</td>
                <td className="px-4 py-3 text-xs text-zinc-400 tabular-nums">{row.entryPrice}</td>
                <td className="px-4 py-3 text-xs text-zinc-400 tabular-nums">{row.topPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
