export interface BillingUser {
  subscriptionTier: string;
  subscriptionStatus: string;
  trialEndsAt: Date | null;
}

const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

export function isPro(user: BillingUser): boolean {
  if (user.subscriptionTier !== "pro") return false;
  if (!ACTIVE_STATUSES.has(user.subscriptionStatus)) return false;
  if (user.subscriptionStatus === "trialing" && user.trialEndsAt) {
    if (new Date() > user.trialEndsAt) return false;
  }
  return true;
}

// Free tier: 1 workspace ever created per account (deletion doesn't reset)
export function canCreateWorkspace(user: BillingUser, lifetimeCount: number) {
  if (isPro(user)) return { allowed: true };
  if (lifetimeCount < 1) return { allowed: true };
  return { allowed: false, reason: "upgrade_required", gate: "workspace_limit" as const };
}

// Free tier: 3 competitors ever added per workspace (deletion doesn't reset)
export function canAddCompetitor(user: BillingUser, lifetimeCount: number) {
  if (isPro(user)) return { allowed: true };
  if (lifetimeCount < 3) return { allowed: true };
  return { allowed: false, reason: "upgrade_required", gate: "competitor_limit" as const };
}

export function canViewRefinedEstimate(user: BillingUser) {
  if (isPro(user)) return { allowed: true };
  return { allowed: false, reason: "upgrade_required", gate: "refined_estimate" as const };
}

export function canViewMarketOpportunity(user: BillingUser) {
  if (isPro(user)) return { allowed: true };
  return { allowed: false, reason: "upgrade_required", gate: "market_opportunity" as const };
}

export function canEvaluateIdea(user: BillingUser) {
  if (isPro(user)) return { allowed: true };
  return { allowed: false, reason: "upgrade_required", gate: "idea_evaluation" as const };
}

export function canExport(user: BillingUser) {
  if (isPro(user)) return { allowed: true };
  return { allowed: false, reason: "upgrade_required", gate: "export" as const };
}

export type GateKey =
  | "competitor_limit"
  | "workspace_limit"
  | "refined_estimate"
  | "market_opportunity"
  | "idea_evaluation"
  | "export";
