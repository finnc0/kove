import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { NodeReport } from "@/app/(app)/workspace/[id]/mockData";
import { synthesizeWorkspace, buildAppSummaries, type WorkspaceSynthesis } from "@/lib/analysis/workspaceSynthesis";

export const runtime = "nodejs";
export const maxDuration = 120;

type Params = { params: Promise<{ id: string }> };

export interface FindingsPricingRow {
  app: string;
  appIcon?: string;
  model: string;
  entryPrice: string;
  topPrice: string;
  rating: number;
  reviewCount: number;
}

export interface WorkspaceFindingsData {
  pricing: FindingsPricingRow[];
  analyzedCount: number;
  synthesis: WorkspaceSynthesis | null;
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const ws = await prisma.workspace.findFirst({ where: { id, userId: session.user.id } });
  if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const nodes = await prisma.node.findMany({
    where: { workspaceId: id, status: "complete", report: { not: null } },
    select: { id: true, name: true, iconUrl: true, report: true },
  });

  // Build pricing table from real node reports
  const pricing: FindingsPricingRow[] = [];
  for (const node of nodes) {
    if (!node.report) continue;
    let report: NodeReport;
    try { report = JSON.parse(node.report); } catch { continue; }

    const tiers = report.pricingTiers ?? [];
    const paid = tiers.filter((t) => t.price !== "$0" && t.price.toLowerCase() !== "free");
    const entryPrice = paid[0]?.price
      ? `${paid[0].price}/${paid[0].period?.replace(/per\s*/i, "").trim() ?? "mo"}`
      : "Free";
    const topPrice = paid.length > 1
      ? `${paid[paid.length - 1].price}/${paid[paid.length - 1].period?.replace(/per\s*/i, "").trim() ?? "mo"}`
      : entryPrice;

    pricing.push({
      app: node.name ?? report.appName,
      appIcon: node.iconUrl ?? undefined,
      model: report.pricingModel,
      entryPrice,
      topPrice,
      rating: report.rating,
      reviewCount: report.reviewCount,
    });
  }

  // Parse stored synthesis, or generate on-demand if missing/stale
  let synthesis: WorkspaceSynthesis | null = null;
  if (ws.findings) {
    try {
      const stored = JSON.parse(ws.findings) as Partial<WorkspaceSynthesis>;
      // nicheOverview is the marker that this is a real WorkspaceSynthesis (not old AnalysisReport format)
      // Re-synthesize if app count changed or the stored data is old format
      if (stored.nicheOverview && stored.appCount === nodes.length) {
        synthesis = stored as WorkspaceSynthesis;
      }
    } catch {}
  }

  let synthesisError: string | null = null;
  if (!synthesis && nodes.length >= 1) {
    try {
      const summaries = buildAppSummaries(nodes);
      if (summaries.length === 0) {
        synthesisError = "buildAppSummaries returned 0 — node reports may not be parseable";
        console.error("[findings]", synthesisError);
      } else {
        synthesis = await synthesizeWorkspace(summaries);
        await prisma.workspace.update({
          where: { id },
          data: { findings: JSON.stringify(synthesis) },
        });
      }
    } catch (e) {
      synthesisError = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
      console.error("[findings] on-demand synthesis failed:", e);
      // Clear bad/stale findings so next load retries fresh
      await prisma.workspace.update({ where: { id }, data: { findings: null } }).catch(() => {});
    }
  }

  return NextResponse.json({
    pricing,
    analyzedCount: nodes.length,
    synthesis,
    synthesisError,
  });
}
