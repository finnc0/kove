"use client";

import Link from "next/link";
import { Layers, Plus, ArrowRight } from "lucide-react";
import type { WorkspaceNode } from "../../../mockData";

interface Props {
  workspaceId: string;
  nodes: WorkspaceNode[];
  analyzingNode?: WorkspaceNode;
  onAddNode: () => void;
}

export function FindingsView({ workspaceId, nodes, analyzingNode, onAddNode }: Props) {
  const completedCount = nodes.filter((n) => n.status === "complete").length;
  const analyzingCount = nodes.filter((n) => n.status === "analyzing").length;

  if (completedCount === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <Layers className="w-8 h-8 text-zinc-800" />
        <div className="text-center">
          <p className="text-sm text-zinc-400">Your findings will appear here</p>
          <p className="text-xs text-zinc-700 mt-1">Add apps to start building your report</p>
        </div>
        <button
          onClick={onAddNode}
          className="mt-2 flex items-center gap-1.5 bg-white text-zinc-900 text-sm font-medium px-5 py-2 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add first app
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center px-8 gap-6">
      {/* App count */}
      <div className="flex items-center gap-2">
        {nodes.filter(n => n.status === "complete").slice(0, 5).map((n, i) => (
          <span
            key={n.id}
            className="w-7 h-7 rounded-full bg-zinc-800 border border-white/[0.08] flex items-center justify-center text-[10px] font-semibold text-zinc-400"
            style={{ marginLeft: i > 0 ? -8 : 0, zIndex: 10 - i, position: "relative" }}
          >
            {n.name?.[0] ?? "?"}
          </span>
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm text-zinc-300 font-medium mb-1">
          {completedCount} app{completedCount !== 1 ? "s" : ""} ready
        </p>
        {analyzingCount > 0 ? (
          <p className="text-xs text-zinc-600">
            {analyzingNode?.name ?? `${analyzingCount} app`} still analyzing…
          </p>
        ) : (
          <p className="text-xs text-zinc-600">Open full report to view findings</p>
        )}
      </div>

      <Link
        href={`/workspace/${workspaceId}/findings`}
        className="flex items-center gap-2 bg-white text-zinc-900 text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-zinc-100 transition-colors"
      >
        View findings
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
