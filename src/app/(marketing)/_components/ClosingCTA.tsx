"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { KoveLogo } from "@/components/KoveLogo";

const EASE = [0.22, 1, 0.36, 1] as const;

export function ClosingCTA() {
  return (
    <section className="relative z-10 border-t border-white/[0.04] px-6 py-32 text-center">
      <div className="mx-auto max-w-6xl flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: EASE }}
          className="flex flex-col items-center"
        >
          <KoveLogo className="mx-auto mb-10 h-8 w-auto" />
          <h2 className="mb-4 text-4xl font-semibold tracking-tight text-white">
            Stop guessing.<br />
            <span className="text-zinc-500">Start knowing.</span>
          </h2>
          <p className="mb-8 text-base text-zinc-600">
            Map your first market free — no card required.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-xl bg-[#2dd4bf] px-6 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-[#5eead4]"
          >
            Analyze a market free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-4 text-xs text-zinc-700">No credit card required</p>
        </motion.div>
      </div>
    </section>
  );
}
