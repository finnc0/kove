export type Severity = "High" | "Medium" | "Low";
export type MarketSignal = "Growing" | "Stable" | "Declining";
export type ReportMode = "market" | "app" | "sweep";

export interface Competitor {
  name: string;
  platforms: string[];
  rating: number;
  reviews: number;
  pricing: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  url: string;
}

export interface PainPoint {
  rank: number;
  title: string;
  severity: Severity;
  sources: string[];
  detail: string;
}

export interface Gap {
  title: string;
  evidence: string;
  relatedPainPoints: string[];
  opportunityId: string;
}

export interface Opportunity {
  id: string;
  title: string;
  marketSize: number;
  buildEffort: number;
  moat: number;
}

export interface PriceTier {
  name: string;
  price: number;
  period: "month" | "year" | "lifetime" | "free" | "one-time";
  isPopular?: boolean;
}

export interface CompetitorPrice {
  name: string;
  model: "Freemium" | "Subscription" | "One-time" | "Free";
  hasFree: boolean;
  startingPrice: number;
  period: "month" | "year" | "lifetime" | "free";
  tiers: PriceTier[];
}

export interface PricingData {
  competitorPricing: CompetitorPrice[];
  modelBreakdown: { model: string; count: number; percentage: number }[];
  avgPaidPrice: number;
  priceRange: { min: number; max: number };
  summary: string;
  recommendation: {
    model: string;
    price: string;
    rationale: string;
    considerations: string[];
  };
}

export interface MockReport {
  id: string;
  title: string;
  mode: ReportMode;
  project: string;
  generatedAt: string;
  marketSnapshot: {
    competitorsFound: number;
    avgRating: number;
    topPlatform: string;
    marketSignal: MarketSignal;
    summary: string;
  };
  competitors: Competitor[];
  pricing: PricingData;
  painPoints: PainPoint[];
  gaps: Gap[];
  opportunities: Opportunity[];
  positioning: {
    intro: string;
    subsections: { heading: string; body: string }[];
    wedge: string;
  };
}

export const MOCK_REPORT: MockReport = {
  id: "mock-report-id",
  title: "AI Note-Taking Apps",
  mode: "market",
  project: "Productivity Tools",
  generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),

  marketSnapshot: {
    competitorsFound: 12,
    avgRating: 4.2,
    topPlatform: "iOS",
    marketSignal: "Growing",
    summary:
      "The AI note-taking market has expanded rapidly over the past 18 months, driven by LLM commoditization and persistent remote-work adoption. iOS dominates with 68% of top-ranked apps. Pricing pressure is intensifying as free tiers become table stakes. The market is consolidating around a small cluster of well-funded incumbents while indie developers exploit niche workflows.",
  },

  competitors: [
    {
      name: "Notion AI",
      platforms: ["Web", "iOS", "Android"],
      rating: 4.4,
      reviews: 52000,
      pricing: "Freemium · from $10/mo",
      description:
        "All-in-one workspace with AI writing, summarization, and Q&A built into the editor. Dominant in the team collaboration segment.",
      strengths: ["Massive user base", "Flexible structure", "Strong brand recognition"],
      weaknesses: ["Steep learning curve", "Slow on mobile", "AI feels bolted on"],
      url: "notion.so",
    },
    {
      name: "Obsidian",
      platforms: ["Web", "iOS"],
      rating: 4.7,
      reviews: 18000,
      pricing: "Freemium · from $8/mo",
      description:
        "Local-first markdown editor with a powerful plugin ecosystem. Cult following among power users. AI features added via community plugins.",
      strengths: ["Privacy-focused", "Highly extensible", "Fast and offline"],
      weaknesses: ["No real-time collaboration", "Learning curve", "AI lags behind"],
      url: "obsidian.md",
    },
    {
      name: "Mem",
      platforms: ["iOS", "Web"],
      rating: 3.9,
      reviews: 4200,
      pricing: "Freemium · from $14.99/mo",
      description:
        "AI-first app that auto-organizes notes by topic without folders. Targets busy professionals who hate filing.",
      strengths: ["Auto-organization", "Smart search", "Clean mobile UX"],
      weaknesses: ["Expensive", "Limited formatting", "Small ecosystem"],
      url: "mem.ai",
    },
    {
      name: "Reflect",
      platforms: ["iOS", "Web"],
      rating: 4.5,
      reviews: 2800,
      pricing: "Paid only · $10/mo",
      description:
        "Networked note-taking with calendar sync and AI assistant. Targets founders and executives who want a second brain.",
      strengths: ["Calendar integration", "Backlinks", "Clean design"],
      weaknesses: ["No free tier", "Limited sharing", "Niche appeal"],
      url: "reflect.app",
    },
  ],

  pricing: {
    competitorPricing: [
      {
        name: "Notion AI", model: "Freemium", hasFree: true, startingPrice: 10, period: "month",
        tiers: [
          { name: "Free",     price: 0,  period: "free" },
          { name: "Plus",     price: 12, period: "month", isPopular: true },
          { name: "Business", price: 18, period: "month" },
          { name: "Enterprise", price: 0, period: "month" },
        ],
      },
      {
        name: "Obsidian", model: "Freemium", hasFree: true, startingPrice: 8, period: "month",
        tiers: [
          { name: "Personal",   price: 0,  period: "free" },
          { name: "Catalyst",   price: 25, period: "year" },
          { name: "Commercial", price: 50, period: "year" },
        ],
      },
      {
        name: "Reflect", model: "Subscription", hasFree: false, startingPrice: 10, period: "month",
        tiers: [
          { name: "Personal", price: 10, period: "month", isPopular: true },
          { name: "Plus",     price: 15, period: "month" },
        ],
      },
      {
        name: "Mem", model: "Freemium", hasFree: true, startingPrice: 14.99, period: "month",
        tiers: [
          { name: "Free", price: 0,     period: "free" },
          { name: "Pro",  price: 14.99, period: "month", isPopular: true },
        ],
      },
    ],
    modelBreakdown: [
      { model: "Freemium",          count: 3, percentage: 75 },
      { model: "Subscription only", count: 1, percentage: 25 },
    ],
    avgPaidPrice: 10.75,
    priceRange: { min: 8, max: 14.99 },
    summary: "The market is freemium-dominated — 75% of top apps offer a free tier, and paid plans cluster tightly in the $8–$15/mo range. Reflect is the outlier with no free tier, and commands loyalty from a narrower, higher-intent audience. Annual billing discounts (typically 20–30%) are standard. There is a visible price gap between $0 (free) and $8 — no app has captured the $3–$5/mo segment.",
    recommendation: {
      model: "Freemium",
      price: "$9/mo · $79/yr",
      rationale: "Price just below the $10 cluster to undercut Notion and Reflect while landing above Obsidian's $8. An annual plan at $79 (saves 27%) converts price-sensitive users who commit. Keep the free tier generous enough to drive organic growth — restrict only AI features and sync beyond 2 devices.",
      considerations: [
        "Free tier should support unlimited notes — restricting note count kills word-of-mouth",
        "Launch with annual-only paid plan to maximize LTV before adding monthly",
        "Consider a $19/mo Pro tier for teams of 2–5 once the solo product is validated",
      ],
    },
  },

  painPoints: [
    {
      rank: 1,
      title: "Notes don't sync reliably across devices",
      severity: "High",
      sources: ["App Store", "Reddit"],
      detail:
        "Users across multiple apps report sync conflicts when editing on different devices. The problem is acute on iOS where background app refresh is restricted. Multiple 1-star reviews cite lost notes as a dealbreaker.",
    },
    {
      rank: 2,
      title: "AI summarization produces generic output",
      severity: "High",
      sources: ["Reddit", "Product Hunt"],
      detail:
        "Users say AI summaries read like someone skimmed the notes. They lack specific details, miss context, and fail to capture the user's own phrasing and priorities. Multiple power users have abandoned AI features entirely.",
    },
    {
      rank: 3,
      title: "No integrated voice or audio capture",
      severity: "Medium",
      sources: ["App Store", "G2"],
      detail:
        "A recurring request across all top apps. Users want to record a meeting or voice memo and have it auto-transcribed and linked to their notes. Current solutions require switching apps, causing friction and context loss.",
    },
    {
      rank: 4,
      title: "Search fails to surface relevant older notes",
      severity: "Medium",
      sources: ["Reddit"],
      detail:
        "Full-text search returns too many results without meaningful ranking. Users struggle to find notes from months ago even when they remember key phrases. Semantic search is either absent or underperforms keyword search.",
    },
    {
      rank: 5,
      title: "Formatting lost when pasting from other apps",
      severity: "Low",
      sources: ["App Store"],
      detail:
        "Rich text copied from Slack, email, or web pages loses formatting when pasted. Tables, links, and code blocks are particularly problematic. Users have developed workarounds involving intermediate apps.",
    },
  ],

  gaps: [
    {
      title: "Reliable cross-device sync with conflict resolution",
      evidence:
        "Every top app has negative reviews specifically about sync issues. No app has solved this convincingly. A CRDT-based architecture (like Linear's) would be a genuine differentiator and a defensible engineering moat.",
      relatedPainPoints: ["Notes don't sync reliably", "Formatting lost when pasting"],
      opportunityId: "sync",
    },
    {
      title: "Voice-first capture with automatic note linking",
      evidence:
        "Audio capture is a top feature request across App Store reviews and Reddit. The current workflow requires 3+ apps. An integrated solution that auto-links transcriptions to open notes eliminates this friction entirely.",
      relatedPainPoints: ["No integrated voice or audio capture", "Search fails to surface older notes"],
      opportunityId: "voice",
    },
    {
      title: "Personalized AI that learns your writing style",
      evidence:
        "Generic AI output is the #2 pain point. Users want an AI that mirrors their vocabulary and priorities, not boilerplate summaries. Fine-tuning or RAG on the user's own corpus creates strong switching costs.",
      relatedPainPoints: ["AI summarization produces generic output"],
      opportunityId: "ai",
    },
  ],

  opportunities: [
    { id: "sync", title: "Sync-first architecture", marketSize: 5, buildEffort: 3, moat: 4 },
    { id: "ai", title: "Personalized AI layer", marketSize: 4, buildEffort: 4, moat: 5 },
    { id: "voice", title: "Voice-first capture", marketSize: 4, buildEffort: 3, moat: 3 },
  ],

  positioning: {
    intro:
      "The AI note-taking market is crowded at the middle — teams, students, and general productivity users are well-served. The clearest opportunity is at the edges: professionals who generate knowledge verbally and need to recall it reliably, not write better.",
    subsections: [
      {
        heading: "Recommended ICP",
        body: "Founders, executives, and consultants who generate knowledge in meetings and conversations. They capture fast, recall reliably, and share selectively. They currently use 2–3 apps to achieve this workflow and still lose things.",
      },
      {
        heading: "Wedge positioning",
        body: "Position as the note-taking app that never loses your work. Lead with sync reliability and voice-first capture. Build the AI layer around recall rather than generation — 'find what you said in that meeting last Tuesday' rather than 'write a summary'.",
      },
      {
        heading: "Differentiation from incumbents",
        body: "Notion AI is bloated for this ICP. Obsidian requires setup expertise. Reflect is closest but lacks voice and is expensive. A focused, reliable, voice-native app wins on simplicity while incumbents compete on feature breadth.",
      },
    ],
    wedge:
      "Build for professionals who think out loud. A sync-reliable, voice-first app that learns from their own notes — not a general-purpose workspace, but a personal intelligence layer for knowledge workers.",
  },
};
