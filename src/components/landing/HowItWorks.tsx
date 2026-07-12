import { Search, BarChart2, Lightbulb } from "lucide-react";

const steps = [
  {
    number: "01",
    Icon: Search,
    title: "Enter a market or paste an app URL",
    description:
      "Type any app category or drop in an App Store, Play Store, or product URL. We handle the rest.",
  },
  {
    number: "02",
    Icon: BarChart2,
    title: "We pull live data from everywhere",
    description:
      "Reviews, ratings, Reddit threads, competitor sites — all fetched and processed automatically.",
  },
  {
    number: "03",
    Icon: Lightbulb,
    title: "Get a full intelligence report",
    description:
      "Competitors mapped, pain points ranked, gaps identified, and positioning angles recommended.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            From idea to insight in three steps
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map(({ number, Icon, title, description }, i) => (
            <div key={number} className="relative flex flex-col">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="absolute left-full top-5 hidden h-px w-full -translate-y-1/2 bg-gradient-to-r from-white/10 to-transparent md:block" />
              )}
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
                <Icon className="h-5 w-5 text-zinc-300" />
              </div>
              <span className="mb-2 text-xs font-semibold text-zinc-600">{number}</span>
              <h3 className="text-base font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
