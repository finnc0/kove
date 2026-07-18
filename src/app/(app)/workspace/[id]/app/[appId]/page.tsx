export const maxDuration = 60;

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { NodeReport } from "../../mockData";
import { normalizeEstimate } from "@/lib/estimation/types";
import type { IOSRawData } from "@/lib/analysis/ios";
import { getAppEstimate } from "@/lib/estimation";

import { AppReportHeaderNew } from "./_components/AppReportHeaderNew";
import { ReportTabs } from "./_components/ReportTabs";
import { ExportButton } from "./_components/ExportButton";
import type { ReportPageData } from "./_components/tabs/types";

export const metadata: Metadata = { title: "App Report — Kove" };

function appAgeString(releaseDate: string): string | null {
  try {
    const months = Math.round(
      (Date.now() - new Date(releaseDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44),
    );
    if (months < 2) return "< 1 mo old";
    if (months < 24) return `${months} mo old`;
    return `${Math.round(months / 12)} yr old`;
  } catch { return null; }
}

type Params = Promise<{ id: string; appId: string }>;

export default async function AppReportPage({ params }: { params: Params }) {
  const session = await auth();
  const { id: workspaceId, appId } = await params;

  const [workspace, node] = await Promise.all([
    prisma.workspace.findFirst({
      where: { id: workspaceId, userId: session?.user?.id ?? "" },
      select: { id: true, name: true },
    }),
    prisma.node.findFirst({
      where: { id: appId, workspaceId },
      select: {
        id: true,
        name: true,
        iconUrl: true,
        status: true,
        report: true,
        rawData: true,
        urlApp: true,
        estimateRefined: true,
        analyzedAt: true,
        errorMessage: true,
      },
    }),
  ]);

  if (!workspace || !node) notFound();

  // Parse report
  let report: NodeReport | null = null;
  if (node.report) {
    try { report = JSON.parse(node.report) as NodeReport; } catch {}
  }

  // Parse rawData
  let rawData: IOSRawData | null = null;
  if (node.rawData) {
    try { rawData = JSON.parse(node.rawData) as IOSRawData; } catch {}
  }

  const nodeStatus = (node.status as "pending" | "analyzing" | "complete" | "failed") ?? "pending";

  // Lazy-fetch estimate for completed nodes analyzed before scraper was wired
  let estimate = normalizeEstimate(report?.estimate);
  if (!estimate && nodeStatus === "complete" && report && rawData?.iTunes?.appId) {
    const fetched = await getAppEstimate(String(rawData.iTunes.appId)).catch(() => null);
    if (fetched) {
      estimate = fetched;
      const updatedReport = { ...report, estimate: fetched };
      await prisma.node.update({
        where: { id: appId },
        data: { report: JSON.stringify(updatedReport) },
      }).catch(() => {});
    }
  }

  // Facts from rawData
  const facts = rawData?.iTunes
    ? {
        releaseDate:   rawData.iTunes.releaseDate,
        lastUpdated:   rawData.iTunes.lastUpdated,
        version:       rawData.iTunes.version,
        languageCount: rawData.iTunes.languages?.length ?? 0,
        charts:        rawData.charts,
        totalRatings:  rawData.iTunes.ratingCount,
        category:      rawData.iTunes.category,
      }
    : null;

  const developerName = rawData?.iTunes?.developerName ?? null;
  const appAge        = facts ? appAgeString(facts.releaseDate) : null;
  const appStoreUrl   = node.urlApp ?? null;

  const positiveCount = rawData?.reviews?.positive?.length;
  const negativeCount = rawData?.reviews?.negative?.length;

  // Slim down reviews to what the UI needs
  const reviews = rawData?.reviews
    ? {
        positive: (rawData.reviews.positive ?? []).map((r) => ({
          id: r.id, rating: r.rating, title: r.title, body: r.body, author: r.author,
        })),
        negative: (rawData.reviews.negative ?? []).map((r) => ({
          id: r.id, rating: r.rating, title: r.title, body: r.body, author: r.author,
        })),
      }
    : null;

  const pageData: ReportPageData = {
    workspaceId,
    workspaceName: workspace.name,
    appId,
    appName:        node.name ?? "Untitled",
    iconUrl:        node.iconUrl ?? null,
    appStoreUrl,
    nodeStatus,
    analyzedAt:     node.analyzedAt ? new Date(node.analyzedAt) : null,
    estimateRefined: node.estimateRefined ?? false,
    category:       report?.category ?? facts?.category ?? null,
    developerName,
    appAge,
    report,
    facts,
    reviews,
    positiveCount,
    negativeCount,
    estimate,
  };

  return (
    <div
      className="min-h-screen bg-zinc-950"
      style={{
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1.5px, transparent 1.5px)",
        backgroundSize: "32px 32px",
      }}
    >
      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Persistent header — always visible */}
        <AppReportHeaderNew
          data={pageData}
          actions={
            nodeStatus === "complete" && report ? (
              <ExportButton appName={node.name ?? "App"} report={report} />
            ) : undefined
          }
        />

        <div className="mb-px h-px bg-white/[0.05]" />
        <div className="mt-2" />

        {/* Failed state */}
        {nodeStatus === "failed" && (
          <div className="mt-6 rounded-xl border border-red-500/15 bg-red-500/[0.04] p-6 text-center">
            <p className="mb-1 text-sm font-medium text-red-400">Couldn&apos;t fetch this app&apos;s data</p>
            <p className="text-xs text-zinc-600">{node.errorMessage ?? "An error occurred during analysis."}</p>
          </div>
        )}

        {/* Tab bar + content (visible in all non-failed states) */}
        {nodeStatus !== "failed" && (
          <ReportTabs data={pageData} />
        )}
      </div>
    </div>
  );
}
