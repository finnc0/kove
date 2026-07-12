"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface BillingState {
  tier: string;
  status: string;
  isPro: boolean;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  hasUsedTrial: boolean;
  loading: boolean;
}

const DEFAULT: BillingState = {
  tier: "explorer",
  status: "free",
  isPro: false,
  trialEndsAt: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  hasUsedTrial: false,
  loading: true,
};

export function useBilling(): BillingState & { refresh: () => void } {
  const [state, setState] = useState<BillingState>(DEFAULT);
  const controller = useRef<AbortController | null>(null);

  const refresh = useCallback(() => {
    controller.current?.abort();
    controller.current = new AbortController();
    fetch("/api/me", { signal: controller.current.signal })
      .then((r) => r.json())
      .then((data) => setState({ ...data, loading: false }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    refresh();

    function onVisible() {
      if (document.visibilityState === "visible") refresh();
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      controller.current?.abort();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  return { ...state, refresh };
}
