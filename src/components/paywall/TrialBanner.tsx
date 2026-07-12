"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { PaywallModal } from "./PaywallModal";

interface Props {
  trialEndsAt: string;
}

export function TrialBanner({ trialEndsAt }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const [open, setOpen] = useState(false);

  const msLeft = new Date(trialEndsAt).getTime() - Date.now();
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

  if (dismissed || daysLeft <= 0) return null;

  const urgent = daysLeft <= 2;

  return (
    <>
      <div className="flex items-center justify-between border-b border-white/[0.05] bg-zinc-900 px-5 py-2">
        <p className={`text-xs ${urgent ? "text-[#2dd4bf]/70" : "text-zinc-500"}`}>
          Pro trial · {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
        </p>
        <div className="flex items-center gap-3">
          {urgent && (
            <button
              onClick={() => setOpen(true)}
              className="text-xs font-medium text-[#2dd4bf] transition-opacity hover:opacity-70"
            >
              Keep Pro
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="text-zinc-700 transition-colors hover:text-zinc-500"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
      <PaywallModal open={open} onClose={() => setOpen(false)} gate="competitor_limit" hasUsedTrial />
    </>
  );
}
