import type { ReactNode } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface Props {
  workspaceId: string;
  workspaceName: string;
  appName: string;
  iconUrl: string | null;
  category: string | null;
  developerName: string | null;
  appAge: string | null;
  nodeStatus: "pending" | "analyzing" | "complete" | "failed";
  analyzedAt: Date | null;
  appStoreUrl: string | null;
  actions?: ReactNode;
}

function StatusDot({ status }: { status: string }) {
  if (status === "complete")
    return <span className="h-2 w-2 rounded-full bg-[#2dd4bf]" />;
  if (status === "analyzing")
    return <span className="h-2 w-2 animate-pulse rounded-full bg-[#2dd4bf]" />;
  if (status === "failed")
    return <span className="h-2 w-2 rounded-full bg-red-500/60" />;
  return <span className="h-2 w-2 rounded-full bg-zinc-700" />;
}

function statusLabel(status: string) {
  if (status === "complete") return "ready";
  if (status === "analyzing") return "analyzing…";
  if (status === "failed") return "failed";
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

export function AppReportHeader({
  workspaceId,
  workspaceName,
  appName,
  iconUrl,
  category,
  developerName,
  appAge,
  nodeStatus,
  analyzedAt,
  appStoreUrl,
  actions,
}: Props) {
  const updated = relTime(analyzedAt);

  return (
    <div className="mb-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-1.5 text-xs text-zinc-600">
        <Link
          href={`/workspace/${workspaceId}`}
          className="transition-colors hover:text-zinc-400"
        >
          ← {workspaceName}
        </Link>
        <span>/</span>
        <span className="text-zinc-500">{appName}</span>
      </div>

      {/* Main header */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          {/* App icon */}
          {iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={iconUrl}
              alt={appName}
              className="h-16 w-16 shrink-0 rounded-2xl object-cover shadow-lg shadow-black/40"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-zinc-800 text-xl font-bold text-zinc-500">
              {appName[0]?.toUpperCase()}
            </div>
          )}

          {/* Name + meta */}
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              {appName}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              {[category, developerName, appAge ? `${appAge} old` : null]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {/* Status row */}
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

        {/* Actions row */}
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
    </div>
  );
}
