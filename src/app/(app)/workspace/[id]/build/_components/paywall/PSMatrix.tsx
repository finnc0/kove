"use client";

import { useState, useCallback } from "react";
import { Check, Minus, Trash2, Pencil } from "lucide-react";
import type { PSFeature, PSTier } from "./types";
import { PSPriceInput } from "./PSPriceInput";
import { GateLineHighlight } from "./GateLineHighlight";

const CATEGORY_DOT: Record<string, string> = {
  "core":         "bg-[#2dd4bf]",
  "nice-to-have": "bg-violet-400",
  "future":       "bg-zinc-600",
};

interface Props {
  workspaceId: string;
  features: PSFeature[];
  tiers: PSTier[];
  onTierPatch: (tierId: string, patch: { name?: string; prices?: Record<string, string> }) => Promise<void>;
  onTierDelete: (tierId: string) => Promise<void>;
  onToggle: (tierId: string, featureId: string, included: boolean) => Promise<void>;
  gateAfterTierIndex: number | null; // draw the gate line after this tier column
}

export function PSMatrix({
  workspaceId,
  features,
  tiers,
  onTierPatch,
  onTierDelete,
  onToggle,
  gateAfterTierIndex,
}: Props) {
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const commitName = useCallback(
    async (tierId: string) => {
      if (editingName.trim()) await onTierPatch(tierId, { name: editingName.trim() });
      setEditingTierId(null);
    },
    [editingName, onTierPatch],
  );

  if (tiers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <p className="text-sm text-zinc-500">No tiers yet</p>
        <p className="text-xs text-zinc-700">Add a tier to start structuring your paywall.</p>
      </div>
    );
  }

  // Build column list: tiers interleaved with gate line
  const columns: Array<{ type: "tier"; tier: PSTier; index: number } | { type: "gate" }> = [];
  tiers.forEach((tier, i) => {
    columns.push({ type: "tier", tier, index: i });
    if (gateAfterTierIndex !== null && i === gateAfterTierIndex) {
      columns.push({ type: "gate" });
    }
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0">
        {/* Header row */}
        <thead>
          <tr>
            {/* Feature column header */}
            <th className="sticky left-0 z-10 w-56 min-w-[14rem] bg-zinc-950 pb-3 pr-4 text-left align-bottom">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600">Feature</p>
            </th>

            {columns.map((col, ci) =>
              col.type === "gate" ? (
                <th key={`gate-${ci}`} className="w-8 pb-3 align-bottom">
                  <GateLineHighlight />
                </th>
              ) : (
                <th
                  key={col.tier.id}
                  className="min-w-[140px] px-3 pb-3 text-center align-bottom"
                >
                  {/* Tier name */}
                  <div className="mb-2 flex items-center justify-center gap-1">
                    {editingTierId === col.tier.id ? (
                      <input
                        autoFocus
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => void commitName(col.tier.id)}
                        onKeyDown={(e) => { if (e.key === "Enter") void commitName(col.tier.id); }}
                        className="w-24 rounded border border-[#2dd4bf]/30 bg-zinc-800 px-2 py-0.5 text-center text-xs text-white focus:outline-none"
                      />
                    ) : (
                      <button
                        onClick={() => { setEditingTierId(col.tier.id); setEditingName(col.tier.name); }}
                        className="group flex items-center gap-1 text-sm font-semibold text-white"
                      >
                        {col.tier.name}
                        <Pencil className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-40" />
                      </button>
                    )}
                    <button
                      onClick={() => void onTierDelete(col.tier.id)}
                      className="text-zinc-700 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100 [tr:hover_&]:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  {/* Price */}
                  <PSPriceInput
                    value={col.tier.prices?.monthly ?? ""}
                    onChange={(v) => void onTierPatch(col.tier.id, { prices: { ...col.tier.prices, monthly: v } })}
                    placeholder="Set price"
                  />
                </th>
              ),
            )}
          </tr>
        </thead>

        {/* Feature rows */}
        <tbody>
          {features.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="py-10 text-center text-xs text-zinc-700">
                Add features in Feature Organizer first.
              </td>
            </tr>
          ) : (
            features.map((feature) => (
              <tr key={feature.id} className="group">
                {/* Feature label */}
                <td className="sticky left-0 z-10 bg-zinc-950 py-2 pr-4">
                  <div className="flex items-center gap-2">
                    <span className={[
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      CATEGORY_DOT[feature.category] ?? CATEGORY_DOT.future,
                    ].join(" ")} />
                    <span className="text-sm text-zinc-300 leading-snug">{feature.title}</span>
                  </div>
                </td>

                {columns.map((col, ci) =>
                  col.type === "gate" ? (
                    <td key={`gate-row-${ci}`} className="w-8 py-2">
                      <div className="h-full border-l-2 border-dashed border-[#2dd4bf]/20" />
                    </td>
                  ) : (
                    <td key={col.tier.id} className="px-3 py-2 text-center">
                      <button
                        onClick={() => void onToggle(col.tier.id, feature.id, !col.tier.featureIds.includes(feature.id))}
                        className={[
                          "mx-auto flex h-6 w-6 items-center justify-center rounded-md border transition-all",
                          col.tier.featureIds.includes(feature.id)
                            ? "border-[#2dd4bf]/40 bg-[#2dd4bf]/[0.12] text-[#2dd4bf]"
                            : "border-white/[0.06] bg-zinc-900 text-zinc-700 hover:border-white/[0.16]",
                        ].join(" ")}
                      >
                        {col.tier.featureIds.includes(feature.id) ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Minus className="h-3 w-3 opacity-30" />
                        )}
                      </button>
                    </td>
                  ),
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
