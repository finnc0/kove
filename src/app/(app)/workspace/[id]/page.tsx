export const maxDuration = 60;

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { WorkspaceHeader } from "./_components/WorkspaceHeader";
import { StatRow } from "./_components/StatRow";
import { CompetitorList, type CompetitorNode } from "./_components/CompetitorList";
import { HeadlineFindings } from "./_components/HeadlineFindings";
import { AddCompetitorRow } from "./_components/AddCompetitorRow";
import { AnalysisPoller } from "./_components/AnalysisPoller";
import { WorkspaceNav } from "./_components/WorkspaceNav";
import type { NodeReport } from "./mockData";
import { normalizeEstimate } from "@/lib/estimation/types";
import { getAppEstimate } from "@/lib/estimation";
import type { WorkspaceSynthesis } from "@/lib/analysis/workspaceSynthesis";
import { canAddCompetitor, canViewMarketOpportunity, isPro } from "@/lib/entitlements";

export const metadata: Metadata = { title: "Market — Kove" };

type NodeStatus = "pending" | "analyzing" | "complete" | "failed";

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toString();
}

function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const hrs = Math.floor(diffMs / 3_600_000);
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatDownloads(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toString();
}

function formatRevenue(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toString();
}

function pricingRange(reports: NodeReport[]): string | null {
  const prices: number[] = [];
  for (const r of reports) {
    if (!r.pricingTiers?.length) continue;
    for (const tier of r.pricingTiers) {
      const raw = (tier.price ?? "").replace(/[^0-9.]/g, "");
      if (!raw) continue;
      const n = parseFloat(raw);
      if (!isNaN(n) && n > 0) {
        // annualise yearly prices to monthly
        const isAnnual =
          (tier.period ?? "").toLowerCase().includes("yr") ||
          (tier.period ?? "").toLowerCase().includes("year");
        prices.push(isAnnual ? n / 12 : n);
        break; // only first paid tier per app
      }
    }
  }
  if (prices.length < 2) return null;
  const lo = Math.min(...prices);
  const hi = Math.max(...prices);
  if (Math.round(lo) === Math.round(hi)) return `$${Math.round(lo)}/mo`;
  return `$${Math.round(lo)}–$${Math.round(hi)}/mo`;
}

// ─────────────────────────────────────────
// Page
// ─────────────────────────────────────────

export default async function WorkspaceHomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  const [workspace, billingUser] = await Promise.all([
    prisma.workspace.findFirst({
      where: { id, userId: session?.user?.id ?? "" },
      include: { nodes: { orderBy: { createdAt: "asc" } } },
    }),
    session?.user?.id
      ? prisma.user.findUnique({
          where: { id: session.user.id },
          select: { subscriptionTier: true, subscriptionStatus: true, trialEndsAt: true },
        })
      : null,
  ]);

  if (!workspace) notFound();

  const userBilling = billingUser ?? { subscriptionTier: "explorer", subscriptionStatus: "free", trialEndsAt: null };
  const userIsPro = isPro(userBilling);
  const hasUsedTrial = billingUser?.trialEndsAt !== null;

  // ── Parse node reports ────────────────────────────────────────────
  type ParsedNode = {
    id: string;
    name: string;
    iconUrl: string | null;
    nodeStatus: NodeStatus;
    report: NodeReport | null;
    downloads: string | null;
    revenue: string | null;
    rating: number | null;
    rawDownloads: number;
    rawRevenue: number;
  };

  const parsedNodes: ParsedNode[] = await Promise.all(
    workspace.nodes.map(async (n) => {
      let report: NodeReport | null = null;
      if (n.report) {
        try { report = JSON.parse(n.report) as NodeReport; } catch {}
      }
      let est = normalizeEstimate(report?.estimate);
      // Lazy-fetch estimate for completed nodes analyzed before scraper was wired in
      if (!est && n.status === "complete" && report && n.rawData) {
        try {
          const rawData = JSON.parse(n.rawData) as { iTunes?: { appId?: string | number } };
          const appStoreId = rawData?.iTunes?.appId ? String(rawData.iTunes.appId) : null;
          if (appStoreId) {
            const fetched = await getAppEstimate(appStoreId).catch(() => null);
            if (fetched) {
              est = fetched;
              const updatedReport = { ...report, estimate: fetched };
              await prisma.node.update({
                where: { id: n.id },
                data: { report: JSON.stringify(updatedReport) },
              }).catch(() => {});
            }
          }
        } catch {}
      }
      return {
        id: n.id,
        name: n.name ?? "Untitled",
        iconUrl: n.iconUrl,
        nodeStatus: (n.status as NodeStatus) ?? "pending",
        report,
        downloads: est?.downloads !== null && est?.downloads !== undefined ? fmtNum(est.downloads) : null,
        revenue: est?.revenue !== null && est?.revenue !== undefined ? `$${fmtNum(est.revenue)}` : null,
        rating: report?.rating ?? null,
        rawDownloads: est?.downloads ?? 0,
        rawRevenue: est?.revenue ?? 0,
      };
    })
  );

  const completedNodes = parsedNodes.filter((n) => n.nodeStatus === "complete");
  const completedCount = completedNodes.length;

  // ── Aggregate stats ────────────────────────────────────────────────
  const totalDownloads = completedNodes.reduce(
    (sum, n) => sum + n.rawDownloads,
    0,
  );
  const totalRevenue = completedNodes.reduce((sum, n) => sum + n.rawRevenue, 0);

  const completedReports = completedNodes
    .map((n) => n.report)
    .filter((r): r is NodeReport => r !== null);

  const pricing = pricingRange(completedReports);

  // ── Parse workspace findings ────────────────────────────────────────
  let synthesis: WorkspaceSynthesis | null = null;
  if (workspace.findings) {
    try {
      synthesis = JSON.parse(workspace.findings) as WorkspaceSynthesis;
    } catch {}
  }

  const painPoints = (synthesis?.painPoints ?? []).map((pp) => ({
    title: pp.title,
    severity: (pp.severity === "Critical" ? "Critical" : pp.severity === "High" ? "High" : "Medium") as
      | "Critical"
      | "High"
      | "Medium"
      | "Low",
  }));

  const gap =
    synthesis?.featureGaps?.length
      ? {
          title: synthesis.featureGaps[0].title,
          opportunity: synthesis.featureGaps[0].opportunity,
        }
      : null;

  // ── Status ────────────────────────────────────────────────────────
  const workspaceStatus =
    workspace.status === "ready"
      ? "ready"
      : workspace.status === "building"
        ? "building"
        : ("empty" as "empty" | "building" | "ready");

  const lastUpdated = relativeTime(new Date(workspace.updatedAt));

  // ── Competitor rows ─────────────────────────────────────────────────
  const competitorNodes: CompetitorNode[] = parsedNodes.map((n) => ({
    id: n.id,
    name: n.name,
    iconUrl: n.iconUrl,
    nodeStatus: n.nodeStatus,
    downloads: n.downloads
      ? formatDownloads(n.rawDownloads)
      : null,
    revenue: n.revenue
      ? formatRevenue(n.rawRevenue)
      : null,
    rating: n.rating,
  }));

  const hasActiveAnalysis = parsedNodes.some(
    (n) => n.nodeStatus === "analyzing" || n.nodeStatus === "pending",
  );

  return (
    <div
      className="min-h-screen bg-zinc-950"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.04) 1.5px, transparent 1.5px)",
        backgroundSize: "32px 32px",
      }}
    >
      <AnalysisPoller hasActive={hasActiveAnalysis} />
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <WorkspaceHeader
          id={workspace.id}
          name={workspace.name}
          brief={workspace.brief}
          status={workspaceStatus}
          nodeCount={parsedNodes.length}
          lastUpdated={lastUpdated}
        />

        {/* Tab navigation */}
        <WorkspaceNav workspaceId={workspace.id} active="home" />

        {/* Stat row */}
        <StatRow
          totalDownloads={totalDownloads}
          totalRevenue={totalRevenue}
          competitorCount={parsedNodes.length}
          painPointCount={painPoints.length}
          hasEnoughData={completedCount >= 3}
        />

        {/* Two-column body */}
        {parsedNodes.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <p className="mb-2 text-base font-medium text-white">
              Add your first competitor to start.
            </p>
            <p className="mb-6 text-sm text-zinc-500">
              Add 3+ to unlock market findings.
            </p>
            <AddCompetitorRow
              workspaceId={workspace.id}
              competitorCount={parsedNodes.length}
              canAddCompetitor={canAddCompetitor(userBilling, parsedNodes.length).allowed}
              hasUsedTrial={hasUsedTrial}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <CompetitorList
              workspaceId={workspace.id}
              nodes={competitorNodes}
              competitorCount={parsedNodes.length}
              canAddCompetitor={canAddCompetitor(userBilling, parsedNodes.length).allowed}
              hasUsedTrial={hasUsedTrial}
            />
            <HeadlineFindings
              workspaceId={workspace.id}
              painPoints={painPoints}
              pricingRange={pricing}
              workspaceStatus={workspaceStatus}
              completedCount={completedCount}
              isProUser={userIsPro}
              hasUsedTrial={hasUsedTrial}
            />
          </div>
        )}
      </div>
    </div>
  );
}

