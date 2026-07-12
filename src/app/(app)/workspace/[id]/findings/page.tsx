import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { WorkspaceSynthesis } from "@/lib/analysis/workspaceSynthesis";
import type { NodeReport } from "@/app/(app)/workspace/[id]/mockData";
import { normalizeEstimate } from "@/lib/estimation/types";
import { getAppEstimate } from "@/lib/estimation";
import { FindingsLoader } from "./_components/FindingsLoader";
import type { FindingsPricingRow } from "./_components/FindingsScroll";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const ws = await prisma.workspace.findFirst({ where: { id }, select: { name: true } });
  return { title: `${ws?.name ?? "Workspace"} — Findings — Kove` };
}

export default async function FindingsPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const { id } = await params;
  const ws = await prisma.workspace.findFirst({ where: { id, userId: session.user.id } });
  if (!ws) notFound();

  const [nodes, allNodes] = await Promise.all([
    prisma.node.findMany({
      where: { workspaceId: id, status: "complete", report: { not: null } },
      select: { id: true, name: true, iconUrl: true, report: true, rawData: true },
    }),
    prisma.node.findMany({
      where: { workspaceId: id },
      select: { id: true, name: true, iconUrl: true, status: true },
    }),
  ]);

  // Parse all node reports (with lazy estimate backfill)
  const parsed: { name: string | null; iconUrl: string | null; report: NodeReport }[] = [];
  for (const node of nodes) {
    if (!node.report) continue;
    try {
      const report = JSON.parse(node.report) as NodeReport;
      // Backfill estimate if missing
      if (!normalizeEstimate(report.estimate) && node.rawData) {
        try {
          const rd = JSON.parse(node.rawData) as { iTunes?: { appId?: string | number } };
          const appStoreId = rd?.iTunes?.appId ? String(rd.iTunes.appId) : null;
          if (appStoreId) {
            const fetched = await getAppEstimate(appStoreId).catch(() => null);
            if (fetched) {
              report.estimate = fetched;
              await prisma.node.update({
                where: { id: node.id },
                data: { report: JSON.stringify({ ...report, estimate: fetched }) },
              }).catch(() => {});
            }
          }
        } catch {}
      }
      parsed.push({ name: node.name, iconUrl: node.iconUrl, report });
    } catch { /* skip malformed */ }
  }

  // Parse a price string to a monthly numeric value for sorting
  function parsePriceNum(s: string): number {
    if (!s || /free/i.test(s)) return 0;
    const m = s.match(/([\d,]+(?:\.\d{1,2})?)/);
    if (!m) return 0;
    const n = parseFloat(m[1].replace(/,/g, ""));
    if (/yr|year|annual/i.test(s)) return n / 12;
    if (/wk|week/i.test(s)) return n * 4.33;
    return n;
  }

  // Build pricing rows — use tier prices exactly as Claude reported from source data
  const pricing: FindingsPricingRow[] = parsed.map(({ name, iconUrl, report }) => {
    const tiers = report.pricingTiers ?? [];
    const paid = tiers
      .filter(t => {
        const raw = (t.price ?? "").trim();
        if (!raw || /free/i.test(raw)) return false;
        const num = parseFloat(raw.replace(/[^0-9.]/g, ""));
        return isNaN(num) ? true : num > 0;
      })
      // Sort tiers lowest → highest so [0] is always the entry price
      .sort((a, b) => parsePriceNum(a.price) - parsePriceNum(b.price));

    const entryPrice = paid[0]?.price ?? "Free";
    const topPrice = paid.length > 1 ? (paid[paid.length - 1].price ?? entryPrice) : entryPrice;
    return {
      app: name ?? report.appName,
      appIcon: iconUrl,
      model: report.pricingModel,
      entryPrice,
      topPrice,
      entryPriceNum: parsePriceNum(entryPrice),
      rating: report.rating,
      reviewCount: report.reviewCount,
    };
  })
  // Sort rows: paid apps by entry price lowest → highest, free apps last
  .sort((a, b) => {
    const aNum = a.entryPriceNum ?? 0;
    const bNum = b.entryPriceNum ?? 0;
    if (aNum === 0 && bNum === 0) return 0;
    if (aNum === 0) return 1;
    if (bNum === 0) return -1;
    return aNum - bNum;
  });

  // Sum download + revenue estimates
  let downloads = 0;
  let revenue = 0;
  for (const { report } of parsed) {
    const est = normalizeEstimate(report.estimate);
    downloads += est?.downloads ?? 0;
    revenue += est?.revenue ?? 0;
  }

  // Return cached synthesis only — client handles generation if missing
  let synthesis: WorkspaceSynthesis | null = null;
  if (ws.findings) {
    try {
      const stored = JSON.parse(ws.findings) as WorkspaceSynthesis;
      if (stored.nicheOverview && stored.appCount === nodes.length) synthesis = stored;
    } catch { /* stale or corrupt */ }
  }

  const analyzingCount = allNodes.filter(
    (n) => n.status === "analyzing" || n.status === "pending",
  ).length;

  return (
    <FindingsLoader
      workspaceName={ws.name}
      workspaceId={id}
      analyzedCount={nodes.length}
      analyzingCount={analyzingCount}
      totalCount={allNodes.length}
      completedApps={allNodes
        .filter((n) => n.status === "complete")
        .map((n) => ({ name: n.name ?? "Untitled", iconUrl: n.iconUrl }))}
      synthesis={synthesis}
      pricing={pricing}
      totals={{ downloads, revenue }}
    />
  );
}
