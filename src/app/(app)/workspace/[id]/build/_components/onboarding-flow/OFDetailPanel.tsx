"use client";

import { useState, useCallback } from "react";
import { X } from "lucide-react";
import { SCREEN_TYPES, TYPE_STYLES } from "./types";
import type { OFScreen, OFTier } from "./types";
import { OFPaywallTierLink } from "./OFPaywallTierLink";
import { OFScreenPromptButton } from "./OFScreenPromptButton";

interface Props {
  screen: OFScreen;
  tiers: OFTier[];
  workspaceId: string;
  onPatch: (id: string, patch: Partial<OFScreen>) => Promise<void>;
  onClose: () => void;
}

export function OFDetailPanel({ screen, tiers, workspaceId, onPatch, onClose }: Props) {
  const [purpose, setPurpose] = useState(screen.purpose ?? "");
  const [notes, setNotes] = useState(screen.notes ?? "");
  const [type, setType] = useState(screen.type);
  const [localAiPrompt, setLocalAiPrompt] = useState(screen.aiPrompt);
  const [saving, setSaving] = useState(false);

  const save = useCallback(async (patch: Partial<OFScreen>) => {
    setSaving(true);
    await onPatch(screen.id, patch);
    setSaving(false);
  }, [screen.id, onPatch]);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-0.5">Screen #{screen.order + 1}</p>
          <h3 className="text-sm font-semibold text-white">{screen.title}</h3>
        </div>
        <button onClick={onClose} className="mt-0.5 shrink-0 text-zinc-600 hover:text-zinc-400 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-5 p-5">
        {/* Type selector */}
        <div>
          <label className="mb-2 block text-xs font-medium text-zinc-500">Type</label>
          <div className="flex flex-wrap gap-1.5">
            {SCREEN_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => {
                  setType(t.value);
                  void save({ type: t.value });
                }}
                className={[
                  "rounded-full border px-2.5 py-1 text-xs font-medium transition-all",
                  type === t.value
                    ? (TYPE_STYLES[t.value] ?? "bg-zinc-700 text-zinc-300 border-zinc-600")
                    : "border-white/[0.06] bg-zinc-800/60 text-zinc-500 hover:text-zinc-300",
                ].join(" ")}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Purpose */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-500">Purpose</label>
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            onBlur={() => void save({ purpose: purpose.trim() || null })}
            placeholder="What does this screen achieve?"
            className="w-full rounded-lg border border-white/[0.06] bg-zinc-800/60 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-[#2dd4bf]/30 focus:outline-none transition-colors"
          />
        </div>

        {/* Paywall tier link */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-500">Paywall tier</label>
          <OFPaywallTierLink
            tiers={tiers}
            value={screen.paywallTierId}
            onChange={(tierId) => void save({ paywallTierId: tierId })}
          />
          {tiers.length === 0 && (
            <p className="mt-1 text-[10px] text-zinc-600">
              Define tiers in Paywall Structurer first.
            </p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-500">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => void save({ notes: notes.trim() || null })}
            placeholder="Wireframe ideas, edge cases, copy notes…"
            rows={4}
            className="w-full resize-none rounded-lg border border-white/[0.06] bg-zinc-800/60 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-[#2dd4bf]/30 focus:outline-none transition-colors"
          />
          {saving && <p className="mt-1 text-[10px] text-zinc-600">Saving…</p>}
        </div>

        {/* Build prompt */}
        <div className="rounded-lg border border-white/[0.05] bg-zinc-800/30 p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Build prompt</p>
          <OFScreenPromptButton
            workspaceId={workspaceId}
            screenId={screen.id}
            existingPrompt={localAiPrompt}
            onGenerated={(p) => setLocalAiPrompt(p)}
          />
        </div>
      </div>
    </div>
  );
}
