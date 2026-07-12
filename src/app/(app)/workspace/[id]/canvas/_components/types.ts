import type { NodeReport } from "../../mockData";
export type { NodeReport };

export type NodeStatus = "pending" | "analyzing" | "complete" | "failed";

export interface CanvasAppNode {
  id: string;
  name: string;
  category: string | null;
  iconUrl: string | null;
  nodeStatus: NodeStatus;
  groupId: string | null;
  downloadsFormatted: string | null;
  revenueFormatted: string | null;
  rawDownloads: number;
  rawRevenue: number;
  rating: number | null;
  primaryPrice: string | null;
  acquisitionTier: string | null;
  topPainTitle: string | null;
  topPainSeverity: "High" | "Medium" | "Low" | null;
  confidence: string | null;
  report: NodeReport | null;
  // Present when this member is an idea node grouped into a container
  memberType?: "competitor" | "idea";
  ideaText?: string | null;
  ideaVerdict?: "strong" | "partial" | "crowded" | null;
  ideaEvaluation?: unknown;
  ideaTargetUser?: string | null;
  ideaKeyFeature?: string | null;
  ideaLastEvaluatedAt?: string | null;
}

export interface CanvasGapInfo {
  title: string;
  opportunity: string;
}
