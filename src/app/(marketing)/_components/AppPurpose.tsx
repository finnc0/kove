import { Search, BarChart2, MessageSquare, Lightbulb } from "lucide-react";

const FEATURES = [
  {
    icon: Search,
    title: "Competitor discovery",
    desc: "Search any app market category. Kove finds the top competing apps on the App Store and Google Play and pulls their metadata, ratings, and pricing.",
  },
  {
    icon: BarChart2,
    title: "Download & revenue estimates",
    desc: "See estimated monthly downloads and revenue for any iOS app, sourced from publicly available App Store data and third-party analytics.",
  },
  {
    icon: MessageSquare,
    title: "User review analysis",
    desc: "Kove reads hundreds of App Store reviews and Reddit discussions to surface the most common complaints, requests, and pain points users have with existing apps.",
  },
  {
    icon: Lightbulb,
    title: "Gap & opportunity reports",
    desc: "AI synthesizes all competitor data into a structured report: where users are underserved, what features are missing, and where a new product could win.",
  },
];

export function AppPurpose() {
  return (
    <section
      id="what-kove-does"
      className="relative z-10 border-t border-white/[0.04] px-6 py-24"
    >
      <div className="mx-auto max-w-4xl">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-600">
          What Kove does
        </p>
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-white">
          AI-powered market research for app founders
        </h2>
        <p className="mb-12 max-w-2xl text-sm leading-relaxed text-zinc-500">
          Kove is a web application that helps startup founders research app markets before
          building. You enter an app category or paste App Store / Google Play URLs, and
          Kove automatically gathers competitor data, user reviews, and market signals —
          then uses AI to generate a structured research report.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6"
            >
              <div className="mb-3 flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05]">
                  <Icon className="h-3.5 w-3.5 text-zinc-400" />
                </div>
                <p className="text-sm font-medium text-white">{title}</p>
              </div>
              <p className="text-sm leading-relaxed text-zinc-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
