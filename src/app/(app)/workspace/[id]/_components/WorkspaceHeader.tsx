import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { StatusDot, type WorkspaceStatus } from "./StatusDot";

interface Props {
  id: string;
  name: string;
  brief: string | null;
  status: WorkspaceStatus;
  nodeCount: number;
  lastUpdated: string;
}

export function WorkspaceHeader({
  id,
  name,
  brief,
  status,
  nodeCount,
  lastUpdated,
}: Props) {
  return (
    <div className="mb-8">
      {/* Breadcrumb */}
      <div className="mb-5 flex items-center gap-1.5">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Markets
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-sm text-zinc-400">{name}</span>
      </div>

      {/* Header row */}
      <div className="flex items-start justify-between gap-4 min-w-0">
        <div className="min-w-0">
        <h1 className="mb-1 text-3xl font-semibold tracking-tight text-white">
          {name}
        </h1>
        {brief && (
          <p className="mb-2 text-base text-zinc-400">
            What I&apos;m building: {brief}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
          <StatusDot status={status} />
          <span className="text-zinc-700">·</span>
          <span>{nodeCount} competitor{nodeCount === 1 ? "" : "s"}</span>
          <span className="text-zinc-700">·</span>
          <span>updated {lastUpdated}</span>
        </div>
        </div>
        <Link
          href={`/workspace/${id}/build`}
          className="shrink-0 flex items-center gap-1.5 rounded-xl bg-[#2dd4bf] px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-[#5eead4]"
        >
          Build Zone
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
