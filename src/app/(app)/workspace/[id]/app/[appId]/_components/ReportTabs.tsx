"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { TabKey, ReportPageData } from "./tabs/types";
import { OverviewTab } from "./tabs/OverviewTab";
import { MarketDataTab } from "./tabs/MarketDataTab";
import { PricingTab } from "./tabs/PricingTab";
import { ReviewsTab } from "./tabs/ReviewsTab";
import { PainPointsTab } from "./tabs/PainPointsTab";
import { SentimentTab } from "./tabs/SentimentTab";
import { MethodologyTab } from "./tabs/MethodologyTab";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview",     label: "Overview" },
  { key: "market-data",  label: "Market Data" },
  { key: "pricing",      label: "Pricing" },
  { key: "reviews",      label: "Reviews" },
  { key: "pain-points",  label: "Pain Points" },
  { key: "sentiment",    label: "Sentiment" },
  { key: "methodology",  label: "Methodology" },
];

function isValidTab(t: string | null): t is TabKey {
  return TABS.some((tab) => tab.key === t);
}

export function ReportTabs({ data }: { data: ReportPageData }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduced = useReducedMotion();

  const raw = searchParams.get("tab");
  const activeTab: TabKey = isValidTab(raw) ? raw : "overview";

  const setTab = useCallback(
    (key: TabKey) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", key);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  // Keyboard arrow nav across tabs
  const tabListRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = tabListRef.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
      if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
      const idx = TABS.findIndex((t) => t.key === activeTab);
      if (idx === -1) return;
      const next =
        e.key === "ArrowRight"
          ? TABS[(idx + 1) % TABS.length]
          : TABS[(idx - 1 + TABS.length) % TABS.length];
      setTab(next.key);
    };
    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, [activeTab, setTab]);

  return (
    <div>
      {/* Sticky tab bar */}
      <div className="sticky top-0 z-20 -mx-6 bg-zinc-950/90 px-6 backdrop-blur-sm">
        <div
          ref={tabListRef}
          role="tablist"
          className="flex items-end gap-0 overflow-x-auto border-b border-white/[0.06] scrollbar-none"
        >
          {TABS.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setTab(tab.key)}
                className={[
                  "relative shrink-0 px-4 pb-3 pt-3 text-sm font-medium transition-colors focus-visible:outline-none",
                  isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300",
                ].join(" ")}
              >
                {tab.label}
                {isActive && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-px bg-[#2dd4bf]"
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
                    }
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={reduced ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduced ? { duration: 0 } : { duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8"
      >
        {activeTab === "overview"    && <OverviewTab    data={data} />}
        {activeTab === "market-data" && <MarketDataTab  data={data} />}
        {activeTab === "pricing"     && <PricingTab     data={data} />}
        {activeTab === "reviews"     && <ReviewsTab     data={data} />}
        {activeTab === "pain-points" && <PainPointsTab  data={data} />}
        {activeTab === "sentiment"   && <SentimentTab   data={data} />}
        {activeTab === "methodology" && <MethodologyTab data={data} />}
      </motion.div>
    </div>
  );
}
