"use client";

import { MoreHorizontal, FileText, RefreshCw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NodeStatusIcon } from "./NodeStatusIcon";
import type { WorkspaceNode } from "../../mockData";

interface Props {
  node: WorkspaceNode;
  isActive: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onReanalyze: (id: string) => void;
}

function StatusLine({ node }: { node: WorkspaceNode }) {
  if (node.status === "pending" || node.status === "analyzing") {
    return (
      <span className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-pulse shrink-0" />
        <span className="text-xs text-zinc-600">Analyzing</span>
      </span>
    );
  }
  if (node.status === "failed") {
    return <span className="text-xs text-red-700">Failed — re-analyze to retry</span>;
  }
  return (
    <span className="text-xs text-zinc-600">
      {node.platform.join(" · ")}
    </span>
  );
}

export function NodeCard({ node, isActive, onSelect, onRemove, onReanalyze }: Props) {
  return (
    <div
      onClick={() => node.status === "complete" && onSelect(node.id)}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative",
        node.status === "complete" ? "cursor-pointer" : "cursor-default",
        isActive
          ? "bg-white/[0.08]"
          : node.status === "complete"
          ? "hover:bg-white/[0.04]"
          : ""
      )}
    >
      <NodeStatusIcon name={node.name} icon={node.icon} status={node.status} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{node.name}</p>
        <StatusLine node={node} />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          className="opacity-0 group-hover:opacity-100 transition-opacity outline-none inline-flex items-center justify-center w-7 h-7 rounded-md text-zinc-500 hover:text-white hover:bg-white/[0.06]"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          {node.status === "complete" && (
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => onSelect(node.id)}
            >
              <FileText className="w-4 h-4" />
              View report
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onReanalyze(node.id)}
            disabled={node.status === "analyzing" || node.status === "pending"}
          >
            <RefreshCw className="w-4 h-4" />
            Re-analyze
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onRemove(node.id)}
          >
            <Trash2 className="w-4 h-4" />
            Remove from workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
