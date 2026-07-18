"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ExternalLink, Lock } from "lucide-react";
import { useBilling } from "@/hooks/useBilling";
import { MetricCard } from "./MetricCard";
import type { ReportPageData } from "./tabs/types";

function StatusDot({ status }: { status: string }) {
  if (status === "complete")  return <span className="h-2 w-2 rounded-full bg-[#2dd4bf]" />;
  if (status === "analyzing") return <span className="h-2 w-2 animate-pulse rounded-full bg-[#2dd4bf]" />;
  if (status === "failed")    return <span className="h-2 w-2 rounded-full bg-red-500/60" />;
  return <span className="h-2 w-2 rounded-full bg-zinc-700" />;
}

function statusLabel(s: string) {
  if (s === "complete")  return "ready";
  if (s === "analyzing") return "analyzing…";
  if (s === "failed")    return "failed";
  return "pending";
}

function relTime(date: Date | null): string {
  if (!date) return "";
  const diff = Date.now() - date.getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function LockedStatCard({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
      <div className="flex items-center gap-1.5">
        <Lock className="h-3.5 w-3.5 text-zinc-700" />
        <span className="text-3xl font-bold text-zinc-700">—</span>
      </div>
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <span className="mt-0.5 w-fit rounded-full bg-[#2dd4bf]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#2dd4bf]/60">
        Pro
      </span>
    </div>
  );
}

interface Props {
  data: ReportPageData;
  actions?: ReactNode;
}

export function AppReportHeaderNew({ data, actions }: Props) {
  const {
    workspaceId, workspaceName, appName, iconUrl,
    category, developerName, appAge,
    nodeStatus, analyzedAt, appStoreUrl,
    report, estimate, estimateRefined,
  } = data;

  const billing  = useBilling();
  const isPro    = !billing.loading && billing.isPro;
  const updated  = relTime(analyzedAt);

  return (
    <div className="mb-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-1.5 text-xs text-zinc-600">
        <Link href={`/workspace/${workspaceId}`} className="transition-colors hover:text-zinc-400">
          ← {workspaceName}
        </Link>
        <span>/</span>
        <span className="text-zinc-500">{appName}</span>
      </div>

      {/* Identity row */}
      <div className="flex items-start justify-between gap-6 mb-8">
        <div className="flex items-start gap-4">
          {iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={iconUrl} alt={appName} className="h-16 w-16 shrink-0 rounded-2xl object-cover shadow-lg shadow-black/40" />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-zinc-800 text-xl font-bold text-zinc-500">
              {appName[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-3xl font-semibold tracking-tight text-white">{appName}</h1>
              {estimateRefined && (
                <span className="rounded-full border border-[#2dd4bf]/20 bg-[#2dd4bf]/[0.06] px-2 py-0.5 text-[10px] font-medium text-[#2dd4bf]">
                  refined
                </span>
              )}
              {!estimateRefined && nodeStatus === "complete" && (
                <span className="rounded-full border border-zinc-700 bg-zinc-800/60 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                  preliminary
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-zinc-400">
              {[category, developerName, appAge].filter(Boolean).join(" · ")}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <StatusDot status={nodeStatus} />
                {statusLabel(nodeStatus)}
              </span>
              {updated && (
                <>
                  <span className="text-zinc-700">·</span>
                  <span>updated {updated}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          {appStoreUrl && (
            <a
              href={appStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:border-white/[0.16] hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              App Store
            </a>
          )}
        </div>
      </div>

      {/* 4 headline stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {isPro && estimate?.downloads != null ? (
          <MetricCard label="Downloads / mo" value={estimate.downloads} isEstimate />
        ) : (
          <LockedStatCard label="Downloads / mo" />
        )}
        {isPro && estimate?.revenue != null ? (
          <MetricCard label="Revenue / mo" value={estimate.revenue} prefix="$" isEstimate />
        ) : (
          <LockedStatCard label="Revenue / mo" />
        )}
        <MetricCard
          label="App Store rating"
          value={report?.rating ? Math.round(report.rating * 10) : 0}
          ratingMode
        />
        <MetricCard
          label="Total ratings"
          value={report?.reviewCount ?? 0}
        />
      </div>
    </div>
  );
}
