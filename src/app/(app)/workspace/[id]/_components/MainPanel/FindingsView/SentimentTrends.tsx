interface FindingsSignal { theme: string; frequency: string; quote: string; app: string; appIcon?: string; }

export function SentimentTrends({ signals }: { signals: FindingsSignal[] }) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-white">Positive Signals</h2>
        <span className="text-xs text-zinc-600">{signals.length} signals</span>
      </div>
      <div className="space-y-2.5">
        {signals.map((sig, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-medium text-white">{sig.theme}</p>
              <span className="text-xs text-zinc-600">{sig.frequency}</span>
            </div>
            <p className="text-xs text-zinc-500 italic leading-relaxed border-l-2 border-white/[0.08] pl-3 mb-2">
              &ldquo;{sig.quote}&rdquo;
            </p>
            <div className="flex items-center gap-1.5">
              {sig.appIcon && (
                <img src={sig.appIcon} alt="" className="w-3.5 h-3.5 rounded-[3px] object-cover" />
              )}
              <span className="text-xs text-zinc-600">{sig.app}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
