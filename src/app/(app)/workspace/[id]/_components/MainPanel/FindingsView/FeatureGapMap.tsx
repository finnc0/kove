import { Check, X } from "lucide-react";

const PRESENT = [
  "Basic note creation and editing",
  "Cross-device sync (when online)",
  "Tag-based organization",
  "Mobile app (iOS + Android)",
  "Markdown support",
  "Search (keyword-based)",
];

const MISSING = [
  "True offline-first mobile experience",
  "Semantic / AI-powered search",
  "Reliable sync without conflicts",
  "Voice-to-note capture",
  "Personalized AI (learns your writing)",
  "Fast cold-start on mobile",
];

export function FeatureGapMap() {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-white">Feature Gap Map</h2>
        <span className="text-xs text-zinc-600">{MISSING.length} gaps found</span>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">
            Present across niche
          </p>
          <div className="space-y-2.5">
            {PRESENT.map((f) => (
              <div key={f} className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-zinc-600 shrink-0 mt-0.5" />
                <span className="text-sm text-zinc-500">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">
            Absent across niche
          </p>
          <div className="space-y-2.5">
            {MISSING.map((f) => (
              <div key={f} className="flex items-start gap-2">
                <X className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                <span className="text-sm text-white font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
