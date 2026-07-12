import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PainPointRow } from "./PainPointRow";

interface PainItem {
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
}

interface Props {
  workspaceId: string;
  painPoints: PainItem[];
  pricingRange: string | null;
  workspaceStatus: "empty" | "building" | "ready";
  completedCount: number;
  isProUser?: boolean;
  hasUsedTrial?: boolean;
}

export function HeadlineFindings({
  workspaceId,
  painPoints,
  pricingRange,
  workspaceStatus,
  completedCount,
  isProUser = false,
  hasUsedTrial = false,
}: Props) {
  const isEmpty = completedCount === 0;
  const isBuilding = workspaceStatus === "building";

  return (
    <div className="flex flex-col gap-5">
      {/* Section heading */}
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-600">
        What we&apos;re seeing
      </h2>

      {isEmpty && (
        <p className="rounded-xl border border-white/[0.05] bg-zinc-900/40 p-5 text-sm text-zinc-600">
          Findings appear after you add competitors.
        </p>
      )}

      {!isEmpty && (
        <>
          {/* Top pain points */}
          {painPoints.length > 0 ? (
            <div className="rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
              <p className="mb-4 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
                Shared pain points
              </p>
              <div className="space-y-3">
                {painPoints.slice(0, 3).map((pp) => (
                  <PainPointRow
                    key={pp.title}
                    title={pp.title}
                    severity={pp.severity}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-white/[0.05] bg-zinc-900/40 p-5">
              <p className="text-sm text-zinc-600">
                {isBuilding
                  ? "Pain points are being synthesized…"
                  : "Add 3+ competitors to surface shared pain points."}
              </p>
            </div>
          )}

          {/* Pricing landscape */}
          {pricingRange && (
            <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-zinc-900 px-5 py-4">
              <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">
                Pricing range
              </p>
              <p className="text-sm font-medium text-zinc-300">{pricingRange}</p>
            </div>
          )}
        </>
      )}

      {/* CTA */}
      {completedCount >= 3 && (
        <Link
          href={`/workspace/${workspaceId}/findings`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#2dd4bf] px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-[#5eead4]"
        >
          See full findings
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
