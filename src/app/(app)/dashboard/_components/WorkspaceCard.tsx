"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
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
import { Button } from "@/components/ui/button";
import { StatusDot } from "./StatusDot";

export type WorkspaceStatus = "empty" | "building" | "ready";

export interface WorkspaceApp {
  iconUrl: string | null;
  name: string | null;
}

export interface Workspace {
  id: string;
  name: string;
  nodeCount: number;
  nodes: WorkspaceApp[];
  status: WorkspaceStatus;
  lastUpdated: string;
  opportunitySnippet: string | null;
  painPointCount: number;
}

const MAX_AVATARS = 5;

function AppAvatars({ nodes }: { nodes: WorkspaceApp[] }) {
  const visible = nodes.slice(0, MAX_AVATARS);
  const overflow = nodes.length - MAX_AVATARS;

  if (nodes.length === 0) {
    return (
      <div className="flex items-center gap-1">
        <div className="h-7 w-7 rounded-lg border border-dashed border-white/[0.08]" />
        <div className="h-7 w-7 rounded-lg border border-dashed border-white/[0.06]" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {visible.map((node, i) =>
        node.iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={node.iconUrl}
            alt={node.name ?? ""}
            className="h-7 w-7 rounded-lg object-cover"
          />
        ) : (
          <div
            key={i}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] bg-zinc-800"
          >
            <span className="text-[10px] text-zinc-500">
              {(node.name ?? "?")[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
        ),
      )}
      {overflow > 0 && (
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] bg-zinc-800">
          <span className="text-[9px] text-zinc-500">+{overflow}</span>
        </div>
      )}
    </div>
  );
}

export function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  const router = useRouter();
  const [name, setName] = useState(workspace.name);
  const [draft, setDraft] = useState(workspace.name);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleCardClick() {
    router.push(`/workspace/${workspace.id}`);
  }

  async function handleSaveRename() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === name) {
      setRenameOpen(false);
      return;
    }
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
      const res = await fetch(`/api/workspaces/${workspace.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteOpen(false);
        router.refresh();
      }
    } finally {
      setDeleting(false);
    }
  }

  const statsLine = [
    `${workspace.nodeCount} ${workspace.nodeCount === 1 ? "app" : "apps"}`,
    workspace.painPointCount > 0
      ? `${workspace.painPointCount} shared pain point${workspace.painPointCount === 1 ? "" : "s"}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        onClick={handleCardClick}
        className="group relative flex cursor-pointer flex-col rounded-2xl border border-white/[0.06] bg-zinc-900 p-6 transition-colors duration-150 hover:border-white/[0.14]"
      >
        {/* Top row: niche name + status + menu */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <p className="text-lg font-medium leading-snug text-white">{name}</p>
          <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
            <StatusDot status={workspace.status} />
            <div
              className="opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-600 outline-none transition-colors hover:bg-white/[0.06] hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="flex cursor-pointer items-center gap-2"
                    onClick={() => {
                      setDraft(name);
                      setRenameOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    className="flex cursor-pointer items-center gap-2"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete market
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* App avatars */}
        <div className="mb-3">
          <AppAvatars nodes={workspace.nodes} />
        </div>

        {/* Stats line */}
        <p className="mb-5 text-sm text-zinc-400">{statsLine}</p>

        {/* Divider */}
        <div className="mt-auto border-t border-white/[0.05] pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">Updated {workspace.lastUpdated}</span>
            {workspace.status === "ready" && workspace.opportunitySnippet && (
              <span className="flex items-center gap-1 text-xs font-medium text-[#2dd4bf]">
                The Gap found
                <ArrowRight className="h-3 w-3" />
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Rename dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Rename market</DialogTitle>
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
            <Button
              variant="outline"
              onClick={() => setRenameOpen(false)}
              disabled={renaming}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveRename} disabled={renaming}>
              {renaming && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete market</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete &ldquo;{name}&rdquo; and all{" "}
            {workspace.nodeCount}{" "}
            {workspace.nodeCount === 1 ? "app" : "apps"} inside it. This
            cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
