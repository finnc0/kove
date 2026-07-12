"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { FindingsScroll, type FindingsPricingRow } from "./FindingsScroll";
import type { WorkspaceSynthesis } from "@/lib/analysis/workspaceSynthesis";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

const REQUIRED = 3;

// Must match the step indices emitted by the generate route
const STEPS = [
  { label: "Loading workspace",     donePct: 10  },
  { label: "Loading app data",      donePct: 13  },
  { label: "Parsing reports",       donePct: 15  },
  { label: "Synthesizing with AI",  donePct: 92  },
  { label: "Saving findings",       donePct: 100 },
];

const TOP_NAV_PX = 56;

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

// ─── Gate screen shown when < 3 apps are complete ───────────────────────────
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
      {/* Back link */}
      <Link
        href={`/workspace/${workspaceId}`}
        className="absolute z-10 flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
        style={{ top: 18, left: 32 }}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {workspaceName}
      </Link>

      {/* Centered content */}
      <div className="flex flex-1 flex-col items-center justify-center px-8">
        <div className="w-full max-w-sm">
          {/* Section label */}
          <p className="mb-10 text-[10px] font-semibold tracking-[0.22em] text-zinc-600 uppercase">
            Findings
          </p>

          {/* Progress dots — 3 slots */}
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

          {/* Headline */}
          <h1 className="mb-3 text-2xl font-semibold text-white leading-snug">
            {analyzedCount === 0
              ? "Add 3 competitors to unlock findings"
              : stillProcessing && analyzedCount < REQUIRED
                ? `${analyzedCount} of ${REQUIRED} apps ready`
                : `${analyzedCount} of ${REQUIRED} apps analyzed`}
          </h1>

          {/* Sub-text */}
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

          {/* Completed apps so far */}
          {completedApps.length > 0 && (
            <div className="mb-8 space-y-2">
              {completedApps.map((app, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  {app.iconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={app.iconUrl}
                      alt=""
                      className="h-5 w-5 rounded-md object-cover"
                    />
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
                  <span className="text-sm text-zinc-600">
                    {analyzingCount} analyzing…
                  </span>
                </div>
              )}
            </div>
          )}

          {/* CTAs */}
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

// ─── Main loader ─────────────────────────────────────────────────────────────
export function FindingsLoader(props: Props) {
  const [synthesis, setSynthesis] = useState(props.synthesis);
  const [pct, setPct] = useState(0);
  const [activeStep, setActiveStep] = useState(-1);
  const [failed, setFailed] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);

  const belowThreshold = props.analyzedCount < REQUIRED;
  const needsGeneration = !belowThreshold && !synthesis;

  useEffect(() => {
    if (!needsGeneration) return;
    if (cancelRef.current) { cancelRef.current(); cancelRef.current = null; }

    let cancelled = false;
    cancelRef.current = () => { cancelled = true; };

    (async () => {
      try {
        const res = await fetch(
          `/api/workspaces/${props.workspaceId}/findings/generate`,
          { method: "POST" },
        );
        if (cancelled) return;

        const reader = res.body?.getReader();
        if (!reader) { if (!cancelled) setFailed(true); return; }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (cancelled) { reader.cancel(); return; }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const event = JSON.parse(line.slice(6));
              if (event.type === "step") {
                flushSync(() => { setActiveStep(event.step); setPct(event.pct); });
              } else if (event.type === "progress") {
                setPct(event.pct);
              } else if (event.type === "complete") {
                flushSync(() => { setPct(100); setActiveStep(STEPS.length); });
                setTimeout(() => { if (!cancelled) setSynthesis(event.synthesis); }, 400);
              } else if (event.type === "error") {
                setFailed(true);
              }
            } catch { /* malformed line */ }
          }
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => { cancelled = true; cancelRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsGeneration, props.workspaceId]);

  // Not enough apps — show gate
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

  // Synthesis ready — show scroll
  if (synthesis) {
    return <FindingsScroll {...props} synthesis={synthesis} />;
  }

  // Generating
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
        <div className="max-w-sm w-full px-8">
          {failed ? (
            <div className="text-center">
              <p className="text-white text-lg font-medium mb-2">Synthesis failed</p>
              <p className="text-zinc-500 text-sm mb-6">
                Go back and try adding more apps, or refresh.
              </p>
              <Link
                href={`/workspace/${props.workspaceId}`}
                className="inline-flex items-center gap-1.5 text-sm text-zinc-300 border border-white/[0.1] rounded-lg px-5 py-2.5 hover:bg-white/[0.04] transition-colors"
              >
                Back to workspace
              </Link>
            </div>
          ) : (
            <>
              <p className="text-white text-base font-medium mb-1">Generating findings</p>
              <p className="text-zinc-500 text-xs mb-6">
                Synthesizing {props.analyzedCount} apps into a market brief
              </p>

              <div className="w-full h-px bg-white/[0.06] rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full bg-white/70 rounded-full"
                  style={{
                    width: `${pct}%`,
                    transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                />
              </div>
              <p className="text-[11px] text-zinc-700 text-right mb-7 tabular-nums">{pct}%</p>

              <div className="space-y-3">
                {STEPS.map((step, i) => {
                  const isDone = i < activeStep || pct >= step.donePct;
                  const isActive = i === activeStep && !isDone;
                  return (
                    <div key={step.label} className="flex items-center gap-3">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-200 ${
                          isDone
                            ? "bg-white"
                            : isActive
                              ? "bg-white/50 animate-pulse"
                              : "bg-white/[0.10]"
                        }`}
                      />
                      <span
                        className={`text-sm transition-colors duration-200 ${
                          isDone
                            ? "text-zinc-300"
                            : isActive
                              ? "text-zinc-400"
                              : "text-zinc-700"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
