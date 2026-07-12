"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { SettingsCard } from "./SettingsCard";

export function DangerSection() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmValue, setConfirmValue] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch("/api/user", { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) return;
    setOpen(false);
    router.push("/");
  }

  return (
    <SettingsCard title="Danger zone" description="Permanent and irreversible actions" danger>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white">Delete account</p>
          <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed max-w-sm">
            Permanently delete your account and all workspaces. This cannot be undone.
          </p>
        </div>
        <button
          onClick={() => { setConfirmValue(""); setOpen(true); }}
          className="shrink-0 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
        >
          Delete account
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete your account</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground leading-relaxed">
            This will permanently delete your Kove account, all workspaces, and all analyzed data.
            This action cannot be undone.
          </p>

          <div className="mt-2">
            <p className="text-sm text-zinc-400 mb-2">
              Type <span className="font-mono font-medium text-white">DELETE</span> to confirm:
            </p>
            <Input
              value={confirmValue}
              onChange={(e) => setConfirmValue(e.target.value)}
              placeholder="DELETE"
              autoFocus
            />
          </div>

          <DialogFooter>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg border border-white/[0.10] px-4 py-2 text-sm text-zinc-400 hover:text-white hover:border-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={confirmValue !== "DELETE" || deleting}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Delete my account
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsCard>
  );
}
