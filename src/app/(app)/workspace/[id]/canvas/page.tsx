export const maxDuration = 60;

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CanvasLoader } from "./_components/CanvasLoader";
import type { InitialNote, InitialGroup, InitialIdea } from "./_components/Canvas";
import type { CanvasAppNode, CanvasGapInfo, NodeReport } from "./_components/types";
import { normalizeEstimate } from "@/lib/estimation/types";
import { getAppEstimate } from "@/lib/estimation";
import type { WorkspaceSynthesis } from "@/lib/analysis/workspaceSynthesis";
import type { IdeaEvaluation } from "@/app/api/workspaces/[id]/idea/evaluate/route";
import { isPro } from "@/lib/entitlements";

export const metadata: Metadata = { title: "Canvas — Kove" };

type NodeStatus = "pending" | "analyzing" | "complete" | "failed";

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toString();
}

function firstPaidPrice(report: NodeReport | null): string | null {
  if (!report?.pricingTiers?.length) return null;
  for (const tier of report.pricingTiers) {
    const raw = (tier.price ?? "").replace(/[^0-9.]/g, "");
    if (!raw) continue;
    const n = parseFloat(raw);
    if (!isNaN(n) && n > 0) return tier.price;
  }
  return null;
}

export default async function CanvasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  const [billingUser, workspace] = await Promise.all([
    session?.user?.id
      ? prisma.user.findUnique({
          where: { id: session.user.id },
          select: { subscriptionTier: true, subscriptionStatus: true, trialEndsAt: true },
        })
      : null,
    prisma.workspace.findFirst({
      where: { id, userId: session?.user?.id ?? "" },
      include: {
      nodes: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          type: true,
          urlApp: true,
          iconUrl: true,
          status: true,
          report: true,
          rawData: true,
          platformBadges: true,
          canvasX: true,
          canvasY: true,
          groupId: true,
          updatedAt: true,
        },
      },
      canvasNotes: {
        orderBy: { createdAt: "asc" },
        select: { id: true, text: true, x: true, y: true, pinnedToNodeId: true },
      },
      canvasGroups: {
        orderBy: { createdAt: "asc" },
        select: { id: true, label: true, color: true, nodeIds: true, x: true, y: true, collapsed: true },
      },
      ideaNodes: {
        orderBy: { createdAt: "asc" as const },
        select: {
          id: true,
          text: true,
          targetUser: true,
          keyFeature: true,
          verdict: true,
          evaluationJson: true,
          lastEvaluatedAt: true,
          x: true,
          y: true,
        },
      },
    },
  }),
  ]);

  if (!workspace) notFound();

  const isProUser = isPro(billingUser ?? { subscriptionTier: "explorer", subscriptionStatus: "free", trialEndsAt: null });

  // ── Parse node reports ────────────────────────────────────────────────
  const appNodes: CanvasAppNode[] = await Promise.all(
    workspace.nodes.map(async (n) => {
      let report: NodeReport | null = null;
      if (n.report) {
        try { report = JSON.parse(n.report) as NodeReport; } catch {}
      }

      let est = normalizeEstimate(report?.estimate);
      if (!est && n.status === "complete" && report && n.rawData) {
        try {
          const rd = JSON.parse(n.rawData) as { iTunes?: { appId?: string | number } };
          const appStoreId = rd?.iTunes?.appId ? String(rd.iTunes.appId) : null;
          if (appStoreId) {
            const fetched = await getAppEstimate(appStoreId).catch(() => null);
            if (fetched) {
              est = fetched;
              await prisma.node.update({
                where: { id: n.id },
                data: { report: JSON.stringify({ ...report, estimate: fetched }) },
              }).catch(() => {});
            }
          }
        } catch {}
      }

      const rawDownloads = est?.downloads ?? 0;
      const rawRevenue = est?.revenue ?? 0;
      const topPain = report?.painPoints?.[0] ?? null;

      return {
        id: n.id,
        name: n.name ?? "Untitled",
        category: report?.category ?? null,
        iconUrl: n.iconUrl ?? null,
        nodeStatus: (n.status as NodeStatus) ?? "pending",
        groupId: n.groupId ?? null,
        downloadsFormatted: rawDownloads > 0 ? formatNum(rawDownloads) : null,
        revenueFormatted: rawRevenue > 0 ? formatNum(rawRevenue) : null,
        rawDownloads,
        rawRevenue,
        rating: report?.rating ?? null,
        primaryPrice: firstPaidPrice(report),
        acquisitionTier: null,
        topPainTitle: topPain?.title ?? null,
        topPainSeverity: topPain?.severity ?? null,
        confidence: null,
        report,
      };
    })
  );

  // ── Parse workspace findings for gap ─────────────────────────────────
  let gap: CanvasGapInfo | null = null;
  if (workspace.findings) {
    try {
      const synthesis = JSON.parse(workspace.findings) as WorkspaceSynthesis;
      const firstGap = synthesis.featureGaps?.[0];
      if (firstGap) {
        gap = {
          title: firstGap.title,
          opportunity: firstGap.opportunity ?? "",
        };
      }
    } catch {}
  }

  // ── Compute latestCompetitorAt for stale detection ───────────────────
  const completedNodes = workspace.nodes.filter((n) => n.status === "complete");
  const latestCompetitorAt =
    completedNodes.length > 0
      ? completedNodes
          .map((n) => n.updatedAt)
          .reduce((max, d) => (d > max ? d : max), new Date(0))
          .toISOString()
      : null;

  // ── Build persisted positions map ─────────────────────────────────────
  const initialPositions: Record<string, { x: number; y: number }> = {};
  for (const n of workspace.nodes) {
    if (n.canvasX !== null && n.canvasY !== null) {
      initialPositions[n.id] = { x: n.canvasX, y: n.canvasY };
    }
  }

  // ── Build initial notes ────────────────────────────────────────────────
  const initialNotes: InitialNote[] = workspace.canvasNotes.map((n) => ({
    noteId: n.id,
    text: n.text,
    x: n.x,
    y: n.y,
    pinnedToNodeId: n.pinnedToNodeId,
  }));

  // ── Build initial groups ───────────────────────────────────────────────
  const initialGroups: InitialGroup[] = workspace.canvasGroups.map((g) => {
    let nodeIds: string[] = [];
    try {
      nodeIds = JSON.parse(g.nodeIds) as string[];
    } catch {}
    return { groupId: g.id, label: g.label, color: g.color, memberIds: nodeIds, x: g.x, y: g.y, collapsed: g.collapsed };
  });

  // ── Build initial ideas ────────────────────────────────────────────────
  const initialIdeas: InitialIdea[] = workspace.ideaNodes.map((idea) => {
    let evaluation: IdeaEvaluation | null = null;
    try {
      evaluation = idea.evaluationJson ? (JSON.parse(idea.evaluationJson) as IdeaEvaluation) : null;
    } catch {}
    return {
      ideaId: idea.id,
      text: idea.text,
      targetUser: idea.targetUser ?? null,
      keyFeature: idea.keyFeature ?? null,
      verdict: (idea.verdict as "strong" | "partial" | "crowded" | null) ?? null,
      evaluation,
      lastEvaluatedAt: idea.lastEvaluatedAt?.toISOString() ?? null,
      x: idea.x,
      y: idea.y,
    };
  });

  return (
    <CanvasLoader
      workspaceId={workspace.id}
      workspaceName={workspace.name}
      appNodes={appNodes}
      gap={gap}
      initialPositions={initialPositions}
      initialNotes={initialNotes}
      initialGroups={initialGroups}
      initialIdeas={initialIdeas}
      latestCompetitorAt={latestCompetitorAt}
      isProUser={isProUser}
    />
  );
}
