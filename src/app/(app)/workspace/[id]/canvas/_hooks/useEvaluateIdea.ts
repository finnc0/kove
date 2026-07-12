"use client";

import { useState } from "react";
import type { IdeaEvaluation } from "@/app/api/workspaces/[id]/idea/evaluate/route";

type Status = "idle" | "analyzing" | "error";

export function useEvaluateIdea({ workspaceId }: { workspaceId: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function evaluate(): Promise<IdeaEvaluation | null> {
    setStatus("analyzing");
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/idea/evaluate`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        const msg = body.error ?? "Evaluation failed";
        setError(msg);
        setStatus("error");
        return null;
      }
      const result = (await res.json()) as IdeaEvaluation;
      setStatus("idle");
      return result;
    } catch {
      setError("Network error — try again");
      setStatus("error");
      return null;
    }
  }

  return { status, error, evaluate };
}
