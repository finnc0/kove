"use client";

import { useBilling } from "@/hooks/useBilling";
import { TrialBanner } from "./TrialBanner";

export function TrialBannerWrapper() {
  const billing = useBilling();

  if (
    billing.loading ||
    billing.status !== "trialing" ||
    !billing.trialEndsAt
  ) {
    return null;
  }

  return <TrialBanner trialEndsAt={billing.trialEndsAt} />;
}
