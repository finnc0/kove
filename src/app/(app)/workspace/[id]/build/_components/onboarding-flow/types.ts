export interface OFScreen {
  id: string;
  buildPlanId: string;
  order: number;
  title: string;
  type: string;
  purpose: string | null;
  wireframeJson: unknown | null;
  aiPrompt: string | null;
  paywallTierId: string | null;
  notes: string | null;
}

export interface OFTier {
  id: string;
  name: string;
  order: number;
}

export const SCREEN_TYPES = [
  { value: "welcome",    label: "Welcome" },
  { value: "value-prop", label: "Value Prop" },
  { value: "signup",     label: "Sign Up" },
  { value: "onboarding", label: "Onboarding" },
  { value: "paywall",    label: "Paywall" },
  { value: "home",       label: "Home" },
  { value: "feature",    label: "Feature" },
  { value: "settings",   label: "Settings" },
  { value: "custom",     label: "Custom" },
] as const;

export const TYPE_STYLES: Record<string, string> = {
  welcome:    "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "value-prop":"bg-violet-500/10 text-violet-400 border-violet-500/20",
  signup:     "bg-teal-500/10 text-[#2dd4bf] border-teal-500/20",
  onboarding: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  paywall:    "bg-red-500/10 text-red-400 border-red-500/20",
  home:       "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  feature:    "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  settings:   "bg-zinc-700/50 text-zinc-400 border-zinc-600/30",
  custom:     "bg-zinc-800/50 text-zinc-500 border-zinc-700/30",
};
