"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchStep } from "./SearchStep";
import { ConfirmStep } from "./ConfirmStep";
import { AnalyzingStep } from "./AnalyzingStep";
import type { AppSearchResult } from "@/app/api/search/route";
import type { NodeType } from "./SearchStep";
import type { WorkspaceNode } from "../../mockData";
import { PaywallModal } from "@/components/paywall/PaywallModal";
import { useBilling } from "@/hooks/useBilling";

type Step = "search" | "confirm" | "analyzing";

interface Props {
  workspaceId: string;
  open: boolean;
  onClose: () => void;
  onNodeAdded: (node: WorkspaceNode) => void;
  existingCategories?: string[];
}

export function AddNodeModal({ workspaceId, open, onClose, onNodeAdded, existingCategories = [] }: Props) {
  const [step, setStep] = useState<Step>("search");
  const [visible, setVisible] = useState(true);
  const [url, setUrl] = useState("");
  const [type, setType] = useState<NodeType>("iOS App");
  const [meta, setMeta] = useState<AppSearchResult | undefined>();
  const [nodeId, setNodeId] = useState<string | null>(null);
  const [appName, setAppName] = useState("");
  const billing = useBilling();
  const [paywallOpen, setPaywallOpen] = useState(false);

  useEffect(() => {
    if (open) { setStep("search"); setUrl(""); setMeta(undefined); setNodeId(null); setVisible(true); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  function transition(fn: () => void) {
    setVisible(false);
    setTimeout(() => { fn(); setTimeout(() => setVisible(true), 30); }, 180);
  }

  function handleSearchContinue(resolvedUrl: string, resolvedType: NodeType, resolvedMeta?: AppSearchResult) {
    setUrl(resolvedUrl);
    setType(resolvedType);
    setMeta(resolvedMeta);
    const name = resolvedMeta?.name ?? resolvedUrl.replace(/https?:\/\//, "").split("/")[0];
    setAppName(name);
    transition(() => setStep("confirm"));
  }

  async function handleConfirm() {
    const res = await fetch(`/api/workspaces/${workspaceId}/nodes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        urlApp: url,
        type: "ios",
        name: appName,
      }),
    });

    if (res.status === 402) { setPaywallOpen(true); return; }
    if (!res.ok) return;
    const node = await res.json();
    setNodeId(node.id);
    transition(() => setStep("analyzing"));
  }

  function handleAnalyzeComplete(name: string) {
    if (!nodeId) return;
    const newNode: WorkspaceNode = {
      id: nodeId,
      name,
      url,
      platform: ["iOS"],
      status: "complete",
      addedAt: "just now",
    };
    onNodeAdded(newNode);
    onClose();
  }

  if (!open && !paywallOpen) return null;

  if (paywallOpen) {
    return (
      <PaywallModal
        open={paywallOpen}
        onClose={() => { setPaywallOpen(false); onClose(); }}
        gate="competitor_limit"
        hasUsedTrial={billing.hasUsedTrial}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-zinc-950 z-50 flex flex-col">
      <div className="h-14 border-b border-white/[0.06] flex items-center justify-between px-8 shrink-0">
        <span className="text-sm font-medium text-white">Add iOS app</span>
        <button onClick={onClose} className="w-8 h-8 inline-flex items-center justify-center rounded-md text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className={cn("max-w-lg w-full transition-all duration-200 ease-out", visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")}>
          {step === "search" && <SearchStep onContinue={handleSearchContinue} />}
          {step === "confirm" && (
            <ConfirmStep
              url={url}
              type={type}
              meta={meta}
              existingCategories={existingCategories}
              onConfirm={handleConfirm}
              onBack={() => transition(() => setStep("search"))}
            />
          )}
          {step === "analyzing" && nodeId && (
            <AnalyzingStep
              workspaceId={workspaceId}
              nodeId={nodeId}
              appName={appName}
              onComplete={handleAnalyzeComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
