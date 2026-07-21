"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

interface Props {
  workspaceId: string;
  onEnter: () => void;
}

export function OnboardingComplete({ workspaceId, onEnter }: Props) {
  const reduced = useReducedMotion();

  // Auto-advance after a short pause
  useEffect(() => {
    const t = setTimeout(onEnter, 1800);
    return () => clearTimeout(t);
  }, [onEnter]);

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <motion.div
        initial={reduced ? {} : { scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2dd4bf]/10 ring-1 ring-[#2dd4bf]/30"
      >
        <Check className="h-7 w-7 text-[#2dd4bf]" strokeWidth={2.5} />
      </motion.div>

      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: EASE }}
      >
        <h2 className="text-2xl font-semibold text-white">Your build space is ready.</h2>
        <p className="mt-2 text-sm text-zinc-500">Taking you there now…</p>
      </motion.div>
    </div>
  );
}
