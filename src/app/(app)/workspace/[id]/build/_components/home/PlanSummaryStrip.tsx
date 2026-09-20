"use client";

import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";

const PLATFORM_LABELS: Record<string, string> = {
  ios: "iOS",
  android: "Android",
  web: "Web",
  cross: "Cross-platform",
};

const MONETIZATION_LABELS: Record<string, string> = {
  subscription: "Subscription",
  "one-time": "One-time",
  freemium: "Freemium",
  free: "Free",
  unsure: "TBD",
};

const PALETTE_LABELS: Record<string, string> = {
  "zinc-teal": "Zinc + Teal",
  "slate-violet": "Slate + Violet",
  "warm-neutral": "Warm Neutral",
  "midnight-sky": "Midnight + Sky",
  "mono-lime": "Mono + Lime",
  "ink-coral": "Ink + Coral",
};

interface Field {
  key: string;
  label: string;
  value: string | null;
  display?: string;
}

interface Props {
  workspaceId: string;
  plan: {
    targetUser: string | null;
    coreValue: string | null;
    monetization: string | null;
    platform: string | null;
    designDirection: string | null;
  };
}

function EditableChip({
  label,
  value,
  display,
  onSave,
}: {
  label: string;
  value: string | null;
  display?: string;
  onSave: (v: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    await onSave(draft.trim());
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className="flex flex-col gap-1">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">{label}</p>
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") setEditing(false);
            }}
            className="flex-1 rounded-lg border border-white/[0.08] bg-zinc-800 px-2 py-1 text-xs text-white focus:border-[#2dd4bf]/40 focus:outline-none"
          />
          <button onClick={save} disabled={saving} className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">
            <Check className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setEditing(false)} className="text-zinc-600 hover:text-zinc-400 transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => { setDraft(value ?? ""); setEditing(true); }}
          className="group flex items-center gap-1.5 text-left"
        >
          <p className="text-xs text-zinc-300 leading-snug">
            {display ?? value ?? <span className="text-zinc-600">Not set</span>}
          </p>
          <Pencil className="h-3 w-3 text-zinc-700 opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
      )}
    </div>
  );
}

export function PlanSummaryStrip({ workspaceId, plan }: Props) {
  const patch = async (field: string, value: string) => {
    await fetch(`/api/workspaces/${workspaceId}/build`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
  };

  return (
    <div className="grid grid-cols-2 gap-5 rounded-xl border border-white/[0.06] bg-zinc-900/60 p-5 sm:grid-cols-3 lg:grid-cols-5">
      <EditableChip
        label="Target user"
        value={plan.targetUser}
        onSave={(v) => patch("targetUser", v)}
      />
      <EditableChip
        label="Core value"
        value={plan.coreValue}
        onSave={(v) => patch("coreValue", v)}
      />
      <EditableChip
        label="Monetization"
        value={plan.monetization}
        display={plan.monetization ? (MONETIZATION_LABELS[plan.monetization] ?? undefined) : undefined}
        onSave={(v) => patch("monetization", v)}
      />
      <EditableChip
        label="Platform"
        value={plan.platform}
        display={plan.platform ? (PLATFORM_LABELS[plan.platform] ?? undefined) : undefined}
        onSave={(v) => patch("platform", v)}
      />
      <EditableChip
        label="Design"
        value={plan.designDirection}
        display={plan.designDirection ? (PALETTE_LABELS[plan.designDirection] ?? undefined) : undefined}
        onSave={(v) => patch("designDirection", v)}
      />
    </div>
  );
}
