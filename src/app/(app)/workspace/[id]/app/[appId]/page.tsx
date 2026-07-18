export const maxDuration = 60;

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { NodeReport } from "../../mockData";
import { normalizeEstimate } from "@/lib/estimation/types";
import type { IOSRawData } from "@/lib/analysis/ios";

import { getAppEstimate } from "@/lib/estimation";

import { AppReportHeader } from "./_components/AppReportHeader";
import { KeyMetrics } from "./_components/KeyMetrics";
import { EstimateBreakdown } from "./_components/EstimateBreakdown";
import { PainPoints } from "./_components/PainPoints";
import { PositiveSignals } from "./_components/PositiveSignals";
// import { AiSynthesis } from "./_components/AiSynthesis"; // temporarily hidden
import { PricingTiers } from "./_components/PricingTiers";
import { SentimentCard } from "./_components/SentimentCard";
import { AppFacts } from "./_components/AppFacts";
import { AppReportSkeleton } from "./_components/AppReportSkeleton";
import { FadeIn } from "./_components/FadeIn";
import { ExportButton } from "./_components/ExportButton";

export const metadata: Metadata = { title: "App Report — Kove" };

function appAgeString(releaseDate: string): string | null {
  try {
    const months = Math.round(
      (Date.now() - new Date(releaseDate).getTime()) /
        (1000 * 60 * 60 * 24 * 30.44),
    );
    if (months < 2) return "< 1 mo old";
    if (months < 24) return `${months} mo old`;
    return `${Math.round(months / 12)} yr old`;
  } catch {
    return null;
  }
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
    try {
      report = JSON.parse(node.report) as NodeReport;
    } catch {}
  }

  // Parse rawData for factual data
  let rawData: IOSRawData | null = null;
  if (node.rawData) {
    try {
      rawData = JSON.parse(node.rawData) as IOSRawData;
    } catch {}
  }

  const nodeStatus = (node.status as "pending" | "analyzing" | "complete" | "failed") ?? "pending";

  // Lazy-fetch estimate for completed nodes that were analyzed before scraper was wired in
  let estimate = normalizeEstimate(report?.estimate);
  if (!estimate && nodeStatus === "complete" && report && rawData?.iTunes?.appId) {
    const appStoreId = String(rawData.iTunes.appId);
    const fetched = await getAppEstimate(appStoreId).catch(() => null);
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
  const facts =
    rawData?.iTunes
      ? {
          releaseDate: rawData.iTunes.releaseDate,
          lastUpdated: rawData.iTunes.lastUpdated,
          version: rawData.iTunes.version,
          languageCount: rawData.iTunes.languages?.length ?? 0,
          charts: rawData.charts,
          totalRatings: rawData.iTunes.ratingCount,
          category: rawData.iTunes.category,
        }
      : null;

  const developerName = rawData?.iTunes?.developerName ?? null;
  const appAge = facts ? appAgeString(facts.releaseDate) : null;
  const appStoreUrl = node.urlApp ?? null;

  const positiveCount = rawData?.reviews?.positive?.length;
  const negativeCount = rawData?.reviews?.negative?.length;

  // Building / error states
  const isBuilding = nodeStatus === "pending" || nodeStatus === "analyzing";
  const isFailed = nodeStatus === "failed";

  return (
    <div
      className="min-h-screen bg-zinc-950"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.025) 1.5px, transparent 1.5px)",
        backgroundSize: "32px 32px",
      }}
    >
      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Header always visible */}
        <FadeIn delay={0}>
          <AppReportHeader
            workspaceId={workspaceId}
            workspaceName={workspace.name}
            appName={node.name ?? "Untitled"}
            iconUrl={node.iconUrl ?? null}
            category={report?.category ?? facts?.category ?? null}
            developerName={developerName}
            appAge={appAge}
            nodeStatus={nodeStatus}
            analyzedAt={node.analyzedAt ? new Date(node.analyzedAt) : null}
            appStoreUrl={appStoreUrl}
            actions={
              nodeStatus === "complete" && report ? (
                <ExportButton appName={node.name ?? "App"} report={report} />
              ) : undefined
            }
          />
        </FadeIn>

        <div className="mb-px h-px bg-white/[0.05]" />
        <div className="mt-8" />

        {/* Skeleton while analyzing */}
        {isBuilding && (
          <FadeIn delay={0.05}>
            <AppReportSkeleton />
          </FadeIn>
        )}

        {/* Error state */}
        {isFailed && (
          <FadeIn delay={0.05}>
            <div className="rounded-xl border border-red-500/15 bg-red-500/[0.04] p-6 text-center">
              <p className="mb-1 text-sm font-medium text-red-400">
                Couldn&apos;t fetch this app&apos;s data
              </p>
              <p className="text-xs text-zinc-600">
                {node.errorMessage ?? "An error occurred during analysis."}
              </p>
            </div>
            {/* Still show facts if rawData was partially captured */}
            {facts && (
              <div className="mt-6">
                <AppFacts facts={facts} />
              </div>
            )}
          </FadeIn>
        )}

        {/* Full report */}
        {nodeStatus === "complete" && report && (
          <>
            {/* Market data + Rating row */}
            <FadeIn delay={0.04}>
              <div className="mb-8 grid grid-cols-1 gap-3 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <EstimateBreakdown estimate={estimate ?? { downloads: null, revenue: null, scrapedAt: null }} />
                </div>
                <div>
                  <KeyMetrics
                    rating={report.rating}
                    reviewCount={report.reviewCount}
                  />
                </div>
              </div>
            </FadeIn>

            {/* Two-column body */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              {/* LEFT — primary 60% */}
              <div className="lg:col-span-3">
                {report.painPoints?.length > 0 && (
                  <FadeIn delay={0.12}>
                    <PainPoints items={report.painPoints} />
                  </FadeIn>
                )}

                {report.positiveSignals?.length > 0 && (
                  <FadeIn delay={0.16}>
                    <PositiveSignals items={report.positiveSignals} />
                  </FadeIn>
                )}

                {/* AI synthesis — temporarily hidden
                {report.aiSynthesis && (
                  <FadeIn delay={0.20}>
                    <AiSynthesis synthesis={report.aiSynthesis} />
                  </FadeIn>
                )}
                */}
              </div>

              {/* RIGHT — sidebar 40% */}
              <div className="lg:col-span-2">
                {report.pricingTiers && (
                  <FadeIn delay={0.1}>
                    <PricingTiers
                      pricingModel={report.pricingModel ?? "Unknown"}
                      tiers={report.pricingTiers}
                    />
                  </FadeIn>
                )}

                <FadeIn delay={0.14}>
                  <SentimentCard
                    rating={report.rating}
                    reviewCount={report.reviewCount}
                    positiveCount={positiveCount}
                    negativeCount={negativeCount}
                  />
                </FadeIn>

                {facts && (
                  <FadeIn delay={0.18}>
                    <AppFacts facts={facts} />
                  </FadeIn>
                )}

              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
