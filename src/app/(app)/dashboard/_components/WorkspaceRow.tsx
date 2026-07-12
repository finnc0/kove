"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  ChevronRight,
  ArrowRight,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export type WorkspaceStatus = "empty" | "building" | "ready";

export interface Workspace {
  id: string;
  name: string;
  nodeCount: number;
  status: WorkspaceStatus;
  lastUpdated: string;
  opportunitySnippet: string | null;
}

function StatusDot({ status }: { status: WorkspaceStatus }) {
  if (status === "building") {
    return <span className="w-2 h-2 rounded-full shrink-0 bg-[#2dd4bf] animate-pulse" />;
  }
  if (status === "ready") {
    return <span className="w-2 h-2 rounded-full shrink-0 bg-green-500" />;
  }
  return <span className="w-2 h-2 rounded-full shrink-0 bg-zinc-700" />;
}

function StatusBadge({ status }: { status: WorkspaceStatus }) {
  if (status === "building") {
    return (
      <Badge variant="outline" className="text-zinc-500 border-[#2dd4bf]/20 bg-[#2dd4bf]/10 text-xs">
        Building
      </Badge>
    );
  }
  if (status === "ready") {
    return (
      <Badge variant="outline" className="text-green-400 border-green-400/30 bg-green-400/10 text-xs">
        Ready
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-zinc-600 border-zinc-700 text-xs">
      Empty
    </Badge>
  );
}

export function WorkspaceRow({ workspace }: { workspace: Workspace }) {
  const router = useRouter();
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [name, setName] = useState(workspace.name);
  const [draft, setDraft] = useState(workspace.name);
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleRowClick() {
    router.push(`/workspace/${workspace.id}`);
  }

  async function handleSaveRename() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === name) { setRenameOpen(false); return; }
    setRenaming(true);
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.ok) {
        setName(trimmed);
        setRenameOpen(false);
        router.refresh();
      }
    } finally {
      setRenaming(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteOpen(false);
        router.refresh();
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div
        onClick={handleRowClick}
        className="flex items-center justify-between px-5 py-4 bg-zinc-900 border border-white/[0.06] rounded-xl hover:border-white/[0.14] hover:bg-zinc-800/60 transition-all duration-150 cursor-pointer group"
      >
        {/* Left */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="min-w-0">
            <p className="text-sm font-medium text-white group-hover:text-zinc-200 truncate">
              {name}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-zinc-500">{workspace.nodeCount} apps analyzed</span>
              <span className="text-zinc-700 text-xs">·</span>
              <span className="text-xs text-zinc-500">Updated {workspace.lastUpdated}</span>
              {workspace.status === "ready" && workspace.opportunitySnippet && (
                <>
                  <span className="text-zinc-700 text-xs">·</span>
                  <span className="text-xs text-zinc-400 italic truncate max-w-[300px]">
                    {workspace.opportunitySnippet}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <StatusBadge status={workspace.status} />

          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-zinc-600 hover:text-white hover:bg-white/[0.06] transition-colors outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => router.push(`/workspace/${workspace.id}`)}
              >
                <ArrowRight className="w-4 h-4" />
                Open workspace
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => { setDraft(name); setRenameOpen(true); }}
              >
                <Pencil className="w-4 h-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="w-4 h-4" />
                Delete workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
        </div>
      </div>

      {/* Rename dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Rename workspace</DialogTitle>
          </DialogHeader>
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleSaveRename()}
            autoFocus
            disabled={renaming}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)} disabled={renaming}>
              Cancel
            </Button>
            <Button onClick={handleSaveRename} disabled={renaming}>
              {renaming && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete workspace</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete &ldquo;{name}&rdquo; and all {workspace.nodeCount}{" "}
            {workspace.nodeCount === 1 ? "app" : "apps"} analyzed inside it. This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
