import type { NodeReport } from "../../../../mockData";
import type { AppEstimate } from "@/lib/estimation/types";
import type { AppFactsData } from "../AppFacts";

export type TabKey =
  | "overview"
  | "market-data"
  | "pricing"
  | "reviews"
  | "pain-points"
  | "sentiment"
  | "methodology";

export interface ReportPageData {
  // identity
  workspaceId: string;
  workspaceName: string;
  appId: string;
  appName: string;
  iconUrl: string | null;
  appStoreUrl: string | null;
  nodeStatus: "pending" | "analyzing" | "complete" | "failed";
  analyzedAt: Date | null;
  estimateRefined: boolean;
  developerName: string | null;
  appAge: string | null;

  // report (AI-generated, may be null while building)
  report: NodeReport | null;

  // facts from rawData (exact, from Apple)
  facts: AppFactsData | null;

  // review counts from rawData
  positiveCount: number | undefined;
  negativeCount: number | undefined;

  // estimate (Pro-gated)
  estimate: AppEstimate | null;
}
