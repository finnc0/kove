import { Users, Zap, Shield, Lightbulb } from "lucide-react";
import type { MockReport } from "./mockData";

const sectionIcons: Record<string, typeof Users> = {
  "Recommended ICP": Users,
  "Wedge positioning": Zap,
  "Differentiation from incumbents": Shield,
};

function InsightCard({ heading, body }: { heading: string; body: string }) {
  const Icon = sectionIcons[heading] ?? Lightbulb;
  const bullets = body
    .split(/\.\s+/)
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter((s) => s.length > 10)
    .slice(0, 3);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-3.5 h-3.5 text-zinc-500" />
        <p className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">{heading}</p>
      </div>
      <ul className="space-y-2.5">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="w-1 h-1 rounded-full bg-zinc-700 shrink-0 mt-1.5" />
            <span className="text-xs text-zinc-500 leading-relaxed">{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Positioning({ positioning }: { positioning: MockReport["positioning"] }) {
  return (
    <section id="positioning" className="mb-4">
      <p className="text-xs font-medium text-zinc-700 uppercase tracking-widest mb-1">07</p>
      <h2 className="text-base font-semibold text-white mb-2">Positioning</h2>
      <p className="text-xs text-zinc-600 leading-relaxed mb-6">{positioning.intro}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {positioning.subsections.map(({ heading, body }) => (
          <InsightCard key={heading} heading={heading} body={body} />
        ))}
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">Recommended wedge</span>
        </div>
        <p className="text-sm text-white leading-relaxed">{positioning.wedge}</p>
      </div>
    </section>
  );
}
