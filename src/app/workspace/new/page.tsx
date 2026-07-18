"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KoveLogo } from "@/components/KoveLogo";
import { StepNiche } from "./_components/StepNiche";
// import { StepBrief } from "./_components/StepBrief"; // temporarily disabled — step 2 removed
import { StepTransition } from "./_components/StepTransition";
import { PaywallModal } from "@/components/paywall/PaywallModal";
import { useBilling } from "@/hooks/useBilling";

export default function NewWorkspacePage() {
  const router = useRouter();
  const billing = useBilling();

  const [visible] = useState(true);
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [paywallOpen, setPaywallOpen] = useState(false);

  // Escape key → back to dashboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push("/dashboard");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);

  async function handleCreate() {
    setLoading(true);
    setCreateError("");
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: niche }),
      });
      if (res.status === 402) {
        setPaywallOpen(true);
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error("Failed to create workspace");
      const workspace = await res.json();
      router.push(`/workspace/${workspace.id}`);
    } catch {
      setCreateError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  /* STEP 2 (brief) — temporarily removed, re-enable when ready
  function transition(fn: () => void) { ... }
  function handleBack() { ... }
  */

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Top bar */}
      <div className="h-14 px-8 flex items-center justify-between border-b border-white/[0.06] shrink-0">
        <KoveLogo className="h-6 w-auto" />
        <Link
          href="/dashboard"
          className="text-sm text-zinc-500 hover:text-white transition-colors"
        >
          Cancel
        </Link>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="max-w-lg w-full">
          <StepTransition visible={visible}>
            <StepNiche
              value={niche}
              onChange={setNiche}
              onContinue={handleCreate}
              loading={loading}
              error={createError}
            />
            {/* STEP 2 (brief) — temporarily removed, re-enable when ready
            <StepBrief
              value={brief}
              onChange={setBrief}
              onSubmit={() => handleCreate()}
              onSkip={() => handleCreate()}
              loading={loading}
              error={createError}
            />
            */}
          </StepTransition>
        </div>
      </div>

      {/* BOTTOM BAR — temporarily removed with step 2
      <div className="h-16 px-8 flex items-center justify-between border-t border-white/[0.06] shrink-0">
        <div>
          {step === 2 && (
            <button onClick={handleBack} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />Back
            </button>
          )}
        </div>
        <span className="text-xs text-zinc-700">{step} of 2</span>
      </div>
      */}

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        gate="workspace_limit"
        hasUsedTrial={billing.hasUsedTrial}
      />
    </div>
  );
}
