"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  /** Whether any node is currently pending/analyzing */
  hasActive: boolean;
  intervalMs?: number;
}

/**
 * Invisible component: polls router.refresh() while nodes are still analyzing.
 * Mount on the workspace home page when any competitor is in pending/analyzing state.
 */
export function AnalysisPoller({ hasActive, intervalMs = 3000 }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (!hasActive) return;
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [hasActive, intervalMs, router]);

  return null;
}
