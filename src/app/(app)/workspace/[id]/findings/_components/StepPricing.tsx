"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { StepShell } from "./Step";

interface PricingRow {
  app: string;
  appIcon?: string | null;
  model: string;
  entryPrice: string;
  topPrice: string;
}

interface Props {
  pricing: PricingRow[];
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function parseMonthly(s: string): number {
  if (!s || /free/i.test(s)) return 0;
  const m = s.match(/([\d,]+(?:\.\d{1,2})?)/);
  if (!m) return 0;
  const n = parseFloat(m[1].replace(/,/g, ""));
  if (/yr|year|annual/i.test(s)) return +(n / 12).toFixed(2);
  if (/wk|week/i.test(s)) return +(n * 4.33).toFixed(2);
  return n;
}

function fmtPrice(n: number): string {
  if (n === 0) return "Free";
  return `$${n % 1 === 0 ? n : n.toFixed(2)}/mo`;
}

export function StepPricing({ pricing }: Props) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const allPrices = pricing
    .flatMap(p => [parseMonthly(p.entryPrice), parseMonthly(p.topPrice)])
    .filter(n => n > 0);
  const minPrice = allPrices.length ? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length ? Math.max(...allPrices) : 0;

  const modelCounts: Record<string, number> = {};
  for (const p of pricing) modelCounts[p.model] = (modelCounts[p.model] ?? 0) + 1;
  const topModel = Object.entries(modelCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Subscription";

  return (
    <StepShell>
      <div ref={ref}>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: EASE }}
          className="text-[10px] font-semibold tracking-[0.22em] text-zinc-600 uppercase mb-10"
        >
          What they charge
        </motion.p>

        {/* Range bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ duration: 0.25, ease: EASE, delay: 0.35 }}
              className="w-2.5 h-2.5 rounded-full bg-white shrink-0"
            />
            <div className="flex-1 h-px bg-white/[0.08] relative overflow-hidden">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.7, ease: EASE, delay: 0.42 }}
                style={{ transformOrigin: "left" }}
                className="absolute inset-0 bg-white"
              />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ duration: 0.25, ease: EASE, delay: 1.05 }}
              className="w-2.5 h-2.5 rounded-full bg-white shrink-0"
            />
          </div>
          <div className="flex justify-between px-0">
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="text-sm font-medium text-zinc-400"
            >
              {fmtPrice(minPrice)}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.3, delay: 1.1 }}
              className="text-sm font-medium text-zinc-400"
            >
              {fmtPrice(maxPrice)}
            </motion.p>
          </div>
        </motion.div>

        {/* Dominant model */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: EASE, delay: 0.5 }}
        >
          <p className="text-2xl font-semibold text-white mb-1.5">
            Most charge {topModel.toLowerCase()}
          </p>
          <p className="text-sm text-zinc-500">{pricing.length} app{pricing.length !== 1 ? "s" : ""} in landscape</p>
        </motion.div>

        {/* Per-app pricing breakdown — source data from individual app reports */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, ease: EASE, delay: 0.8 }}
          className="mt-10 border-t border-white/[0.06] pt-8 space-y-3"
        >
          {pricing.map((p, i) => {
            const isFree = p.model === "Free" || (p.entryPrice === "Free" && p.topPrice === "Free");
            const priceDisplay = isFree
              ? "Free"
              : p.entryPrice === p.topPrice
              ? p.entryPrice
              : `${p.entryPrice} – ${p.topPrice}`;
            return (
              <motion.div
                key={p.app}
                initial={{ opacity: 0, x: -8 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.3, ease: EASE, delay: 0.85 + i * 0.05 }}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {p.appIcon ? (
                    <img src={p.appIcon} alt="" className="w-5 h-5 rounded-[4px] shrink-0 object-cover" />
                  ) : (
                    <span className="w-5 h-5 rounded-[4px] shrink-0 bg-zinc-800 flex items-center justify-center text-[9px] font-bold text-zinc-500">
                      {p.app[0]}
                    </span>
                  )}
                  <span className="text-sm text-zinc-500 truncate">{p.app}</span>
                </div>
                <span className="text-sm font-medium text-zinc-300 shrink-0 tabular-nums">{priceDisplay}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </StepShell>
  );
}
