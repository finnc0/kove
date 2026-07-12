"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";
import { PaywallModal } from "./PaywallModal";
import type { GateKey } from "@/lib/entitlements";

interface Props {
  children: React.ReactNode;
  gate: GateKey;
  label?: string;
  hasUsedTrial?: boolean;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export function LockedOverlay({ children, gate, label = "Unlock with Pro", hasUsedTrial = false }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="relative">
        {/* Content blurred underneath — shows shape, not substance */}
        <div
          className="pointer-events-none select-none opacity-60"
          style={{ filter: "blur(5px)" }}
        >
          {children}
        </div>

        {/* Overlay — transparent, just centers the unlock button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.button
            onClick={() => setOpen(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15, ease: EASE }}
            className="flex items-center gap-2 rounded-full border border-white/[0.1] bg-zinc-900/95 px-4 py-2 text-xs font-medium text-zinc-300 shadow-xl shadow-black/40 backdrop-blur-sm transition-colors hover:border-[#2dd4bf]/30 hover:text-white"
          >
            <Lock className="h-3 w-3 text-[#2dd4bf]" />
            {label}
          </motion.button>
        </div>
      </div>

      <PaywallModal open={open} onClose={() => setOpen(false)} gate={gate} hasUsedTrial={hasUsedTrial} />
    </>
  );
}
