import {
  Globe,
  Star,
  Users,
  AlertCircle,
  TrendingUp,
  FileText,
} from "lucide-react";

const features = [
  {
    Icon: Globe,
    title: "Live market research",
    description:
      "Kove searches the web in real time — no stale databases or outdated reports.",
  },
  {
    Icon: Star,
    title: "App review analysis",
    description:
      "Pull and analyze thousands of real user reviews from the App Store and Google Play.",
  },
  {
    Icon: Users,
    title: "Competitor mapping",
    description:
      "Identify key players, their pricing, positioning, and where they fall short.",
  },
  {
    Icon: AlertCircle,
    title: "Pain point extraction",
    description:
      "Surface the top user frustrations, ranked by frequency and severity.",
  },
  {
    Icon: TrendingUp,
    title: "Gap & opportunity scoring",
    description:
      "Each gap scored on market size, build effort, and competitive moat.",
  },
  {
    Icon: FileText,
    title: "Exportable reports",
    description:
      "Download any report as PDF or Markdown to share with your team.",
  },
];

export default function Features() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Everything you need before building
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
          {features.map(({ Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-colors hover:bg-white/[0.04] hover:border-white/[0.1]"
            >
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
                <Icon className="h-4 w-4 text-zinc-300" />
              </div>
              <h3 className="text-sm font-semibold text-white">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
