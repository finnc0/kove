"use client";

import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

interface Props {
  workspaceId: string;
  workspaceName: string;
  onAddApp: () => void;
}

export function CanvasTopBar({ workspaceId, workspaceName, onAddApp }: Props) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.06] bg-zinc-950 px-4">
      <Link
        href={`/workspace/${workspaceId}`}
        className="flex min-w-0 items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate max-w-[180px]">{workspaceName}</span>
      </Link>

      {/* Center tabs */}
      <div className="flex items-center rounded-lg border border-white/[0.06] bg-zinc-900/60 p-0.5">
        <Link
          href={`/workspace/${workspaceId}`}
          className="rounded-md px-3 py-1 text-xs text-zinc-500 transition-colors hover:text-white"
        >
          Home
        </Link>
        <span className="rounded-md bg-white/[0.08] px-3 py-1 text-xs font-medium text-white">
          Canvas
        </span>
        <Link
          href={`/workspace/${workspaceId}/findings`}
          className="rounded-md px-3 py-1 text-xs text-zinc-500 transition-colors hover:text-white"
        >
          Findings
        </Link>
      </div>

      <button
        onClick={onAddApp}
        className="flex items-center gap-1.5 rounded-lg bg-[#2dd4bf] px-3 py-1.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-[#5eead4]"
      >
        <Plus className="h-3.5 w-3.5" />
        Add app
      </button>
    </div>
  );
}
