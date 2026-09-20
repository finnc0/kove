"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { ScreenShell } from "./ScreenShell";

const OPTIONS = [
  { value: "ios", label: "iOS", desc: "iPhone & iPad" },
  { value: "android", label: "Android", desc: "Google Play" },
  { value: "web", label: "Web app", desc: "Browser-based" },
  { value: "cross", label: "Cross-platform", desc: "iOS + Android (React Native / Flutter)" },
] as const;

interface Props {
  initialValue: string;
  onAdvance: (value: string) => void;
}

export function ScreenPlatform({ initialValue, onAdvance }: Props) {
  const [selected, setSelected] = useState(initialValue);

  return (
    <ScreenShell
      question="What platform?"
      hint="Where will your users find it?"
    >
      <div className="grid grid-cols-2 gap-3">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              setSelected(opt.value);
              onAdvance(opt.value);
            }}
            className={[
              "flex flex-col rounded-xl border px-4 py-4 text-left transition-all",
              selected === opt.value
                ? "border-[#2dd4bf]/40 bg-[#2dd4bf]/[0.06] ring-1 ring-[#2dd4bf]/20"
                : "border-white/[0.06] bg-zinc-900 hover:border-white/[0.16]",
            ].join(" ")}
          >
            <p className="text-sm font-semibold text-white">{opt.label}</p>
            <p className="mt-1 text-xs text-zinc-500">{opt.desc}</p>
          </button>
        ))}
      </div>
    </ScreenShell>
  );
}
