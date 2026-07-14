"use client";

import { useEffect, useRef, useState } from "react";
import { FindingsScroll, type FindingsPricingRow } from "./FindingsScroll";
import type { WorkspaceSynthesis } from "@/lib/analysis/workspaceSynthesis";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

const REQUIRED = 3;
const TOP_NAV_PX = 56;
const POLL_MS = 4000;

interface Props {
  workspaceName: string;
  workspaceId: string;
  analyzedCount: number;
  analyzingCount: number;
  totalCount: number;
  completedApps: { name: string; iconUrl: string | null }[];
  synthesis: WorkspaceSynthesis | null;
  pricing: FindingsPricingRow[];
  totals: { downloads: number; revenue: number };
}

// ─── Gate screen shown when < 3 apps are complete ────────────────────────────
function FindingsGate({
  workspaceId,
  workspaceName,
  analyzedCount,
  analyzingCount,
  completedApps,
}: {
  workspaceId: string;
  workspaceName: string;
  analyzedCount: number;
  analyzingCount: number;
  completedApps: { name: string; iconUrl: string | null }[];
}) {
  const needed = REQUIRED - analyzedCount;
  const stillProcessing = analyzingCount > 0;

  return (
    <div
      className="fixed bg-zinc-950 flex flex-col"
      style={{ top: TOP_NAV_PX, left: 0, right: 0, bottom: 0 }}
    >
      <Link
        href={`/workspace/${workspaceId}`}
        className="absolute z-10 flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
        style={{ top: 18, left: 32 }}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {workspaceName}
      </Link>

      <div className="flex flex-1 flex-col items-center justify-center px-8">
        <div className="w-full max-w-sm">
          <p className="mb-10 text-[10px] font-semibold tracking-[0.22em] text-zinc-600 uppercase">
            Findings
          </p>

          <div className="mb-8 flex items-center gap-3">
            {Array.from({ length: REQUIRED }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <span
                  className={[
                    "h-2.5 w-2.5 rounded-full transition-colors",
                    i < analyzedCount
                      ? "bg-white"
                      : i === analyzedCount && stillProcessing
                        ? "bg-[#2dd4bf] animate-pulse"
                        : "bg-white/[0.1]",
                  ].join(" ")}
                />
                {i < REQUIRED - 1 && (
                  <span className="h-px w-6 bg-white/[0.08]" />
                )}
              </div>
            ))}
          </div>

          <h1 className="mb-3 text-2xl font-semibold text-white leading-snug">
            {analyzedCount === 0
              ? "Add 3 competitors to unlock findings"
              : stillProcessing && analyzedCount < REQUIRED
                ? `${analyzedCount} of ${REQUIRED} apps ready`
                : `${analyzedCount} of ${REQUIRED} apps analyzed`}
          </h1>

          <p className="mb-8 text-sm leading-relaxed text-zinc-500">
            {stillProcessing && analyzedCount < REQUIRED ? (
              <>
                {analyzingCount} app{analyzingCount !== 1 ? "s are" : " is"} still being
                analyzed. Add {needed > 0 ? `${needed} more` : "more"} to unlock the market
                brief.
              </>
            ) : analyzedCount === 0 ? (
              "Findings synthesize shared pain points, pricing patterns, and market gaps across all your competitors."
            ) : (
              <>
                Add {needed} more competitor{needed !== 1 ? "s" : ""} to generate your
                market findings — shared pain points, the gap, and your opening.
              </>
            )}
          </p>

          {completedApps.length > 0 && (
            <div className="mb-8 space-y-2">
              {completedApps.map((app, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  {app.iconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={app.iconUrl} alt="" className="h-5 w-5 rounded-md object-cover" />
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-800 text-[9px] font-bold text-zinc-500">
                      {app.name[0]?.toUpperCase()}
                    </span>
                  )}
                  <span className="text-sm text-zinc-400">{app.name}</span>
                  <span className="ml-auto text-[10px] text-[#2dd4bf]/70">ready</span>
                </div>
              ))}
              {analyzingCount > 0 && (
                <div className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-800/60">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2dd4bf]" />
                  </span>
                  <span className="text-sm text-zinc-600">{analyzingCount} analyzing…</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={`/workspace/${workspaceId}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#2dd4bf] px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-[#5eead4]"
            >
              Add competitor
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/workspace/${workspaceId}/canvas`}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.08] px-5 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:border-white/[0.16] hover:text-white"
            >
              View canvas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main loader ──────────────────────────────────────────────────────────────
export function FindingsLoader(props: Props) {
  const [synthesis, setSynthesis] = useState(props.synthesis);
  const [failed, setFailed] = useState(false);
  const started = useRef(false);

  const belowThreshold = props.analyzedCount < REQUIRED;
  const needsGeneration = !belowThreshold && !synthesis;

  useEffect(() => {
    if (!needsGeneration || started.current) return;
    started.current = true;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    // Kick off generation (fire-and-forget; we poll for the result)
    fetch(`/api/workspaces/${props.workspaceId}/findings/generate`, { method: "POST" }).catch(() => {});

    async function poll() {
      if (cancelled) return;
      try {
        const res = await fetch(`/api/workspaces/${props.workspaceId}/status`);
        if (res.ok) {
          const data = await res.json() as { findings?: WorkspaceSynthesis | null };
          const f = data.findings;
          if (f && f.nicheOverview && f.appCount === props.analyzedCount) {
            if (!cancelled) setSynthesis(f);
            return;
          }
        }
      } catch { /* network hiccup — keep polling */ }
      if (!cancelled) timer = setTimeout(poll, POLL_MS);
    }

    // First poll after 5 s to give generation time to start
    timer = setTimeout(poll, 5000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsGeneration, props.workspaceId, props.analyzedCount]);

  if (belowThreshold) {
    return (
      <FindingsGate
        workspaceId={props.workspaceId}
        workspaceName={props.workspaceName}
        analyzedCount={props.analyzedCount}
        analyzingCount={props.analyzingCount}
        completedApps={props.completedApps}
      />
    );
  }

  if (synthesis) {
    return <FindingsScroll {...props} synthesis={synthesis} />;
  }

  // ── Analyzing state ──────────────────────────────────────────────────────
  return (
    <>
      <Link
        href={`/workspace/${props.workspaceId}`}
        className="fixed z-30 flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
        style={{ top: TOP_NAV_PX + 14, left: 32 }}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {props.workspaceName}
      </Link>

      <div
        className="fixed bg-zinc-950 flex items-center justify-center"
        style={{ top: TOP_NAV_PX, left: 0, right: 0, bottom: 0 }}
      >
        {failed ? (
          <div className="text-center px-8">
            <p className="text-white text-lg font-medium mb-2">Synthesis failed</p>
            <p className="text-zinc-500 text-sm mb-6">Go back and try again.</p>
            <Link
              href={`/workspace/${props.workspaceId}`}
              className="inline-flex items-center gap-1.5 text-sm text-zinc-300 border border-white/[0.1] rounded-lg px-5 py-2.5 hover:bg-white/[0.04] transition-colors"
            >
              Back to workspace
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <span className="h-2 w-2 rounded-full bg-[#2dd4bf] animate-pulse" />
            <p className="text-sm font-medium text-zinc-400">Analyzing</p>
          </div>
        )}
      </div>
    </>
  );
}
