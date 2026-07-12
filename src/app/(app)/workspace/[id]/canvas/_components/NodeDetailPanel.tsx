"use client";

import { useState } from "react";
import { X, Trash2, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CanvasAppNode } from "./types";

const EASE = [0.22, 1, 0.36, 1] as const;

const SEV_CLASS: Record<string, string> = {
  High: "border-zinc-500/30 bg-white/[0.06] text-zinc-200",
  Medium: "border-zinc-600/20 bg-white/[0.03] text-zinc-400",
  Low: "border-zinc-700/20 text-zinc-600",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
        {title}
      </p>
      {children}
    </div>
  );
}

function StatCard({ label, value, est }: { label: string; value: string; est?: boolean }) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-zinc-900 p-3">
      <p className="text-sm font-semibold text-white">{value}</p>
      <p className="mt-0.5 text-[10px] text-zinc-600">
        {label}
        {est && <span className="ml-1 text-zinc-700">est.</span>}
      </p>
    </div>
  );
}

interface Props {
  appNode: CanvasAppNode;
  workspaceId: string;
  onClose: () => void;
  onRemove: () => void;
}

export function NodeDetailPanel({ appNode, workspaceId, onClose, onRemove }: Props) {
  const router = useRouter();
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removing, setRemoving] = useState(false);
  const r = appNode.report;

  async function handleRemove() {
    setRemoving(true);
    try {
      await fetch(`/api/workspaces/${workspaceId}/nodes/${appNode.id}`, {
        method: "DELETE",
      });
      onRemove();
      router.refresh();
    } catch {
      setRemoving(false);
    }
  }

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.25, ease: EASE }}
      className="absolute right-0 top-0 z-10 flex h-full w-[420px] flex-col border-l border-white/[0.06] bg-zinc-950"
    >
      {/* Sticky header */}
      <div className="sticky top-0 z-10 shrink-0 border-b border-white/[0.06] bg-zinc-950 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            {appNode.iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={appNode.iconUrl}
                className="h-10 w-10 shrink-0 rounded-xl object-cover"
                alt=""
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-sm font-semibold text-zinc-400">
                {appNode.name[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">{appNode.name}</p>
              <p className="text-xs text-zinc-500">
                {r?.category ?? appNode.category ?? "App"}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {appNode.nodeStatus === "complete" && (
              <Link
                href={`/workspace/${workspaceId}/app/${appNode.id}`}
                className="flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-white"
                title="View full report"
              >
                Full report
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            )}
            <button
              onClick={() => setConfirmRemove(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-700 transition-colors hover:bg-red-500/10 hover:text-red-400"
              title="Remove app"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Inline remove confirmation */}
        {confirmRemove && (
          <div className="mt-3 rounded-xl border border-red-500/15 bg-red-500/[0.06] p-3">
            <p className="mb-2.5 text-xs text-zinc-300">
              Remove <span className="font-medium text-white">{appNode.name}</span>?
              This clears synthesized findings.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRemove}
                disabled={removing}
                className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                {removing ? "Removing…" : "Remove"}
              </button>
              <button
                onClick={() => setConfirmRemove(false)}
                disabled={removing}
                className="rounded-lg px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable body */}
      <div className="scrollbar-dark flex-1 overflow-y-auto px-5 py-5">
        {/* Overview stats */}
        <Section title="Overview">
          <div className="mb-3 grid grid-cols-2 gap-2">
            <StatCard
              label="Downloads/mo"
              value={appNode.downloadsFormatted ?? "—"}
              est
            />
            <StatCard
              label="Revenue/mo"
              value={
                appNode.revenueFormatted
                  ? `$${appNode.revenueFormatted}`
                  : "—"
              }
              est
            />
            <StatCard
              label="Rating"
              value={
                r?.rating
                  ? `★ ${r.rating.toFixed(1)} (${(r.reviewCount / 1000).toFixed(0)}K)`
                  : appNode.rating
                    ? `★ ${appNode.rating.toFixed(1)}`
                    : "—"
              }
            />
            <StatCard label="Pricing" value={r?.pricingModel ?? "—"} />
          </div>
          {r?.description && (
            <p className="text-sm leading-relaxed text-zinc-500">
              {r.description}
            </p>
          )}
        </Section>

        {/* Pricing tiers */}
        {r?.pricingTiers && r.pricingTiers.length > 0 && (
          <Section title="Pricing tiers">
            <div className="space-y-2">
              {r.pricingTiers.map((tier, i) => (
                <div
                  key={i}
                  className={[
                    "flex items-center justify-between rounded-lg border px-3 py-2.5",
                    tier.isPopular
                      ? "border-[#2dd4bf]/20 bg-[#2dd4bf]/[0.04]"
                      : "border-white/[0.05] bg-zinc-900",
                  ].join(" ")}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">
                        {tier.name}
                      </p>
                      {tier.isPopular && (
                        <span className="rounded-full bg-[#2dd4bf]/15 px-1.5 py-px text-[10px] font-medium text-[#2dd4bf]">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-600">{tier.period}</p>
                  </div>
                  <p className="text-sm font-semibold text-zinc-300">
                    {tier.price}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Pain points */}
        {r?.painPoints && r.painPoints.length > 0 && (
          <Section title="Pain points">
            <div className="space-y-3">
              {r.painPoints.map((pp, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/[0.05] bg-zinc-900 p-3"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={[
                        "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                        SEV_CLASS[pp.severity] ?? SEV_CLASS.Medium,
                      ].join(" ")}
                    >
                      {pp.severity}
                    </span>
                    <p className="text-sm font-medium text-white">{pp.title}</p>
                  </div>
                  {pp.quote && (
                    <p className="text-xs italic leading-relaxed text-zinc-500">
                      &ldquo;{pp.quote}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Positive signals */}
        {r?.positiveSignals && r.positiveSignals.length > 0 && (
          <Section title="What users praise">
            <div className="space-y-3">
              {r.positiveSignals.map((s, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/[0.05] bg-zinc-900 p-3"
                >
                  <p className="mb-1 text-sm font-medium text-white">
                    {s.theme}
                  </p>
                  <p className="mb-2 text-[10px] text-zinc-600">
                    {s.frequency}
                  </p>
                  {s.quote && (
                    <p className="text-xs italic leading-relaxed text-zinc-500">
                      &ldquo;{s.quote}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* AI synthesis */}
        {r?.aiSynthesis && (
          <Section title="AI synthesis">
            <div className="space-y-3">
              {r.aiSynthesis.doesWell && (
                <div className="rounded-xl border border-white/[0.05] bg-zinc-900 p-3">
                  <p className="mb-1.5 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
                    Does well
                  </p>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    {r.aiSynthesis.doesWell}
                  </p>
                </div>
              )}
              {r.aiSynthesis.fails && (
                <div className="rounded-xl border border-white/[0.05] bg-zinc-900 p-3">
                  <p className="mb-1.5 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
                    Fails at
                  </p>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    {r.aiSynthesis.fails}
                  </p>
                </div>
              )}
              {r.aiSynthesis.implication && (
                <div className="rounded-xl border border-[#2dd4bf]/15 bg-[#2dd4bf]/[0.03] p-3">
                  <p className="mb-1.5 text-[10px] font-medium uppercase tracking-widest text-[#2dd4bf]/60">
                    Implication
                  </p>
                  <p className="text-sm leading-relaxed text-zinc-300">
                    {r.aiSynthesis.implication}
                  </p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Confidence note */}
        {appNode.confidence && (
          <Section title="Methodology">
            <p className="rounded-xl border border-white/[0.05] bg-zinc-900 p-3 text-sm text-zinc-500">
              {appNode.confidence}
            </p>
          </Section>
        )}
      </div>
    </motion.div>
  );
}
