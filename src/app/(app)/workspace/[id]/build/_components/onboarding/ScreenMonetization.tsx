"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { ScreenShell } from "./ScreenShell";

const OPTIONS = [
  { value: "subscription", label: "Subscription", desc: "Monthly or annual recurring revenue" },
  { value: "one-time", label: "One-time purchase", desc: "Pay once, keep it" },
  { value: "freemium", label: "Freemium", desc: "Free core, paid upgrades" },
  { value: "free", label: "Free", desc: "No monetization yet" },
  { value: "unsure", label: "Not sure yet", desc: "Figure it out later" },
] as const;

interface Props {
  initialValue: string;
  onAdvance: (value: string) => void;
}

export function ScreenMonetization({ initialValue, onAdvance }: Props) {
  const [selected, setSelected] = useState(initialValue);

  return (
    <ScreenShell
      question="How will it make money?"
      hint="You can always change this later."
    >
      <div className="flex flex-col gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              setSelected(opt.value);
              onAdvance(opt.value);
            }}
            className={[
              "flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-all",
              selected === opt.value
                ? "border-[#2dd4bf]/40 bg-[#2dd4bf]/[0.06] ring-1 ring-[#2dd4bf]/20"
                : "border-white/[0.06] bg-zinc-900 hover:border-white/[0.16]",
            ].join(" ")}
          >
            <div>
              <p className="text-sm font-medium text-white">{opt.label}</p>
              <p className="text-xs text-zinc-500">{opt.desc}</p>
            </div>
            {selected === opt.value && (
              <ArrowRight className="h-4 w-4 shrink-0 text-[#2dd4bf]" />
            )}
          </button>
        ))}
      </div>
    </ScreenShell>
  );
}
