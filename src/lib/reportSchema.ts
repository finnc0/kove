export type ReportMode = "market" | "app" | "sweep";
export type Severity = "High" | "Medium" | "Low";
export type MarketSignal = "Growing" | "Stable" | "Declining";

export interface MarketSnapshot {
  competitorsFound: number;
  avgRating: number;
  topPlatform: string;
  marketSignal: MarketSignal;
  summary: string;
}

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

export interface Positioning {
  intro: string;
  subsections: { heading: string; body: string }[];
  wedge: string;
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

export interface PricingAnalysis {
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

export interface AnalysisReport {
  id: string;
  title: string;
  mode: ReportMode;
  project: string;
  generatedAt: string;
  marketSnapshot: MarketSnapshot;
  competitors: Competitor[];
  pricing?: PricingAnalysis;
  painPoints: PainPoint[];
  gaps: Gap[];
  opportunities: Opportunity[];
  positioning: Positioning;
}
