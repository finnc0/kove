import { SignalRow } from "./SignalRow";

interface Signal {
  theme: string;
  frequency: string;
  quote: string;
}

export function PositiveSignals({ items }: { items: Signal[] }) {
  if (!items.length) return null;

  return (
    <div className="mb-5 rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
      <h3 className="mb-4 text-sm font-semibold text-white">What users love</h3>
      <div className="divide-y divide-white/[0.04]">
        {items.map((s, i) => (
          <SignalRow
            key={i}
            title={s.theme}
            severity="High"
            quote={s.quote}
            reviewCount={undefined}
            variant="positive"
          />
        ))}
      </div>
    </div>
  );
}
