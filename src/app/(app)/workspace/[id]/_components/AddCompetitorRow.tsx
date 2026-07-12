"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { AddNodeModal } from "./AddNodeModal/AddNodeModal";
import { PaywallModal } from "@/components/paywall/PaywallModal";
import { UpgradeChip } from "@/components/paywall/UpgradeChip";
import type { WorkspaceNode } from "../mockData";

interface Props {
  workspaceId: string;
  competitorCount?: number;
  canAddCompetitor?: boolean;
  hasUsedTrial?: boolean;
}

export function AddCompetitorRow({
  workspaceId,
  competitorCount = 0,
  canAddCompetitor = true,
  hasUsedTrial = false,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);

  function handleNodeAdded(_node: WorkspaceNode) {
    setOpen(false);
    router.refresh();
  }

  function handleClick() {
    if (!canAddCompetitor) {
      setPaywallOpen(true);
    } else {
      setOpen(true);
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="group flex w-full cursor-pointer items-center gap-2.5 rounded-lg border border-dashed border-white/[0.06] p-4 text-left transition-colors hover:border-white/[0.14]"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] transition-colors group-hover:border-[#2dd4bf]/30">
          <Plus className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-[#2dd4bf]" />
        </div>
        <span className="text-sm text-zinc-600 transition-colors group-hover:text-zinc-400">
          Add competitor
        </span>
        {!canAddCompetitor && (
          <>
            <span className="ml-auto">
              <UpgradeChip />
            </span>
            <span className="text-xs text-zinc-600">({competitorCount}/3 free)</span>
          </>
        )}
      </button>

      <AddNodeModal
        workspaceId={workspaceId}
        open={open}
        onClose={() => setOpen(false)}
        onNodeAdded={handleNodeAdded}
      />

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        gate="competitor_limit"
        hasUsedTrial={hasUsedTrial}
      />
    </>
  );
}
