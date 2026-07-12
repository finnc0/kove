import type { AppEstimate } from "@/lib/estimation/types";
export type { AppEstimate };

export type NodeStatus = "pending" | "analyzing" | "complete" | "failed";

export interface WorkspaceNode {
  id: string;
  name: string;
  url: string;
  icon?: string;
  platform: string[];
  status: NodeStatus;
  addedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  nodeCount: number;
  completedCount: number;
  status: "empty" | "building" | "ready";
}

export interface PainPoint {
  id: string;
  title: string;
  description: string;
  appCount: number;
  apps: string[];
  severity: "High" | "Medium" | "Low";
}

export interface PricingRow {
  app: string;
  model: "Freemium" | "Subscription" | "One-time" | "Usage-based" | "Free";
  hasFree: boolean;
  entry: string;
  mid: string;
  top: string;
}

export interface SentimentTheme {
  theme: string;
  direction: "Consistently negative" | "Mixed" | "Consistently positive";
  description: string;
}

export interface PricingTier {
  name: string;
  price: string;
  period: string;
  features: string[];
  isPopular?: boolean;
}

export interface NodeReport {
  nodeId: string;
  appName: string;
  icon?: string;
  platforms: string[];
  rating: number;
  reviewCount: number;
  category: string;
  lastUpdated: string;
  description: string;
  pricingModel: string;
  pricingTiers: PricingTier[];
  monthlyDownloads: string;
  momGrowth: string;
  growthDir: "up" | "down";
  topCountry: string;
  trafficSource: string;
  positiveSignals: { theme: string; frequency: string; quote: string }[];
  painPoints: { title: string; severity: "High" | "Medium" | "Low"; reviewCount?: number; quote: string }[];
  communitySummary: string;
  communityQuotes: string[];
  aiSynthesis: {
    doesWell: string;
    fails: string;
    implication: string;
  };
  estimate?: AppEstimate;
}

export const MOCK_WORKSPACE: Workspace = {
  id: "mock-id",
  name: "AI note-taking apps",
  nodeCount: 3,
  completedCount: 2,
  status: "building",
};

export const MOCK_NODES: WorkspaceNode[] = [
  {
    id: "node-1",
    name: "Notion",
    url: "https://notion.so",
    platform: ["iOS", "Android", "Web"],
    status: "complete",
    addedAt: "2 hours ago",
  },
  {
    id: "node-2",
    name: "Obsidian",
    url: "https://obsidian.md",
    platform: ["iOS", "Android", "Web"],
    status: "complete",
    addedAt: "2 hours ago",
  },
  {
    id: "node-3",
    name: "Mem",
    url: "https://mem.ai",
    platform: ["iOS", "Web"],
    status: "analyzing",
    addedAt: "5 minutes ago",
  },
];

export const MOCK_PAIN_POINTS: PainPoint[] = [
  {
    id: "pp-1",
    title: "Sync fails silently across devices",
    description: "Users lose notes or see stale data with no clear error. Most common on mobile after background refresh is restricted.",
    appCount: 4,
    apps: ["Notion", "Obsidian", "Mem", "Reflect"],
    severity: "High",
  },
  {
    id: "pp-2",
    title: "AI summaries are generic and miss context",
    description: "Summaries read like a skim of the document — they miss the user's priorities and don't reflect their voice.",
    appCount: 3,
    apps: ["Notion", "Mem", "Reflect"],
    severity: "High",
  },
  {
    id: "pp-3",
    title: "No offline support on mobile",
    description: "Apps become read-only or fully unusable without connectivity. Particularly painful for users who take notes in transit.",
    appCount: 3,
    apps: ["Notion", "Mem", "Reflect"],
    severity: "High",
  },
  {
    id: "pp-4",
    title: "Search misses semantically similar content",
    description: "Full-text search only — users can't find notes by meaning or topic, only exact phrases.",
    appCount: 2,
    apps: ["Notion", "Obsidian"],
    severity: "Medium",
  },
  {
    id: "pp-5",
    title: "Steep learning curve for new users",
    description: "Power features require extensive setup and documentation reading. New users churn before finding value.",
    appCount: 2,
    apps: ["Obsidian", "Notion"],
    severity: "Medium",
  },
];

export const MOCK_PRICING: PricingRow[] = [
  { app: "Notion", model: "Freemium", hasFree: true, entry: "$12/mo", mid: "$18/mo", top: "Custom" },
  { app: "Obsidian", model: "Freemium", hasFree: true, entry: "$25/yr", mid: "$50/yr", top: "—" },
  { app: "Mem", model: "Freemium", hasFree: true, entry: "$14.99/mo", mid: "—", top: "—" },
];

export const MOCK_SENTIMENT: SentimentTheme[] = [
  { theme: "Sync reliability", direction: "Consistently negative", description: "Users across all apps report losing work due to sync failures. This is the #1 churn driver." },
  { theme: "AI feature quality", direction: "Mixed", description: "Power users find AI disappointing; casual users rate it positively. Gap is in expectation setting." },
  { theme: "Offline access", direction: "Consistently negative", description: "Mobile offline is treated as optional by all incumbents. Users treat it as table stakes." },
];

export const MOCK_NODE_REPORT: NodeReport = {
  nodeId: "node-1",
  appName: "Notion",
  platforms: ["iOS", "Android", "Web"],
  rating: 4.4,
  reviewCount: 52000,
  category: "Productivity",
  lastUpdated: "May 2025",
  description: "All-in-one workspace combining notes, databases, wikis, and project management. Targets teams and individuals who want a single tool for all their information.",
  pricingModel: "Freemium",
  pricingTiers: [
    { name: "Free", price: "$0", period: "forever", features: ["Unlimited pages", "7-day history", "Basic AI trial"], isPopular: false },
    { name: "Plus", price: "$12", period: "per member/mo", features: ["Unlimited history", "Unlimited file uploads", "Full AI access"], isPopular: true },
    { name: "Business", price: "$18", period: "per member/mo", features: ["Advanced analytics", "Private teamspaces", "SAML SSO"] },
  ],
  monthlyDownloads: "4.2M",
  momGrowth: "+8%",
  growthDir: "up",
  topCountry: "United States",
  trafficSource: "Direct / Word of mouth",
  positiveSignals: [
    { theme: "Flexibility and customization", frequency: "41% of positive reviews", quote: "Nothing else lets me build exactly the workflow I need. Notion is the only tool that adapts to me, not the other way around." },
    { theme: "All-in-one convenience", frequency: "35% of positive reviews", quote: "I cancelled 4 subscriptions after switching to Notion. Everything lives in one place now." },
    { theme: "Template ecosystem", frequency: "22% of positive reviews", quote: "The community templates saved me weeks of setup time. Found one for every workflow I needed." },
  ],
  painPoints: [
    { title: "Mobile app is slow to load", severity: "High", quote: "Opening Notion on my phone takes 8–10 seconds. By that time I've lost the thought I wanted to capture." },
    { title: "Sync conflicts overwrite work", severity: "High", quote: "Lost two hours of writing because an old version synced over my latest. No warning, no recovery." },
    { title: "AI summaries miss context", severity: "Medium", quote: "The AI summarizes what's there but doesn't understand why I wrote it. It's a worse version of me reading my own notes." },
  ],
  communitySummary: "Reddit discussions reveal a deeply polarized user base. Power users defend Notion fiercely while a growing cohort of ex-users cites performance and sync reliability as dealbreakers. The 'Notion is too slow' thread on r/Notion has 2,400 upvotes and 800+ comments.",
  communityQuotes: [
    "I tried to love Notion but after losing a week of notes to sync issues I moved back to Apple Notes. At least that works.",
    "Notion's database features are genuinely unmatched. Nothing else comes close for building internal tools.",
  ],
  aiSynthesis: {
    doesWell: "Notion has built an unmatched surface area — it handles notes, wikis, databases, and light project management in a single tool. The template marketplace creates genuine lock-in. Its brand is aspirational; people show off their Notion setups.",
    fails: "The product is structurally compromised on mobile. Background sync restrictions on iOS mean Notion is effectively unreliable outside a desktop browser. The AI layer feels bolted on — it can't reason about the user's specific notes corpus effectively. Performance degrades badly on large workspaces.",
    implication: "A new entrant that solves mobile reliability (CRDT sync, true offline, fast load) wins the users Notion is currently losing. The AI angle works best if you build it on the user's own corpus from day one, not as a post-hoc feature.",
  },
};
