"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { ScreenShell } from "./ScreenShell";

interface Props {
  initialValue: string;
  onAdvance: (value: string) => void;
}

export function ScreenCoreValue({ initialValue, onAdvance }: Props) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onAdvance(value.trim());
  };

  return (
    <ScreenShell
      question="What's the one thing it has to do?"
      hint="The feature that makes it worth building — the whole value in one sentence."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. Let freelancers track time and auto-generate invoices in under 30 seconds"
          rows={3}
          className="w-full resize-none rounded-xl border border-white/[0.08] bg-zinc-900 px-4 py-3.5 text-base text-white placeholder:text-zinc-600 focus:border-[#2dd4bf]/40 focus:outline-none focus:ring-1 focus:ring-[#2dd4bf]/20 transition-colors"
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
