import { Search, Smartphone, Layers } from "lucide-react";

type Mode = "market" | "app" | "sweep";

const modes: {
  id: Mode;
  icon: typeof Search;
  title: string;
  description: string;
}[] = [
  {
    id: "market",
    icon: Search,
    title: "Market Research",
    description: "Explore a category and map the competitive landscape",
  },
  {
    id: "app",
    icon: Smartphone,
    title: "App Analysis",
    description: "Deep-dive into a specific app's reviews and metadata",
  },
  {
    id: "sweep",
    icon: Layers,
    title: "Full Sweep",
    description: "Combine market research and app analysis together",
  },
];

interface ModeSelectorProps {
  selected: Mode | null;
  onSelect: (mode: Mode) => void;
}

export function ModeSelector({ selected, onSelect }: ModeSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {modes.map(({ id, icon: Icon, title, description }) => (
        <div
          key={id}
          onClick={() => onSelect(id)}
          className={`rounded-xl border p-4 cursor-pointer transition-all ${
            selected === id
              ? "border-white/30 bg-white/[0.06] ring-1 ring-white/10"
              : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1]"
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
            <Icon className="w-4 h-4 text-zinc-300" />
          </div>
          <p className="text-sm font-semibold text-white mt-3">{title}</p>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{description}</p>
        </div>
      ))}
    </div>
  );
}
