"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { ScreenShell } from "./ScreenShell";

interface Props {
  initialValue: string;
  onAdvance: (value: string) => void;
}

export function ScreenTargetUser({ initialValue, onAdvance }: Props) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onAdvance(value.trim());
  };

  return (
    <ScreenShell
      question="Who's it for?"
      hint="One sentence — the person who needs this most."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          autoFocus
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. Freelancers who lose track of client invoices"
          className="w-full rounded-xl border border-white/[0.08] bg-zinc-900 px-4 py-3.5 text-base text-white placeholder:text-zinc-600 focus:border-[#2dd4bf]/40 focus:outline-none focus:ring-1 focus:ring-[#2dd4bf]/20 transition-colors"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#2dd4bf] px-5 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-[#5eead4] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </ScreenShell>
  );
}
