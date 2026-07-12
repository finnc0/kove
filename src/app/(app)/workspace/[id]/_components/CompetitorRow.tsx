"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoreHorizontal, Trash2, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  id: string;
  workspaceId: string;
  name: string;
  iconUrl: string | null;
  nodeStatus: "pending" | "analyzing" | "complete" | "failed";
  downloads: string | null;
  revenue: string | null;
  rating: number | null;
}

export function CompetitorRow({
  id,
  workspaceId,
  name,
  iconUrl,
  nodeStatus,
  downloads,
  revenue,
  rating,
}: Props) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  const isAnalyzing = nodeStatus === "analyzing" || nodeStatus === "pending";
  const isFailed = nodeStatus === "failed";

  const metaParts = [
    downloads ? `~${downloads}/mo` : null,
    revenue ? `$${revenue}/mo` : null,
    rating ? `★ ${rating.toFixed(1)}` : null,
  ].filter(Boolean);

  async function handleRemove() {
    setRemoving(true);
    try {
      await fetch(`/api/workspaces/${workspaceId}/nodes/${id}`, {
        method: "DELETE",
      });
      setConfirmOpen(false);
      router.refresh();
    } catch {
      setRemoving(false);
    }
  }

  return (
    <>
      <div className="group relative flex items-center gap-3 rounded-lg border border-white/[0.06] bg-zinc-900 p-4 transition-colors hover:border-white/[0.14]">
        {/* Clickable overlay for complete apps */}
        {nodeStatus === "complete" && (
          <Link
            href={`/workspace/${workspaceId}/app/${id}`}
            className="absolute inset-0 rounded-lg"
            aria-label={`View ${name} report`}
          />
        )}

        {/* Icon */}
        {iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={iconUrl}
            alt={name}
            className="h-9 w-9 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-zinc-800 text-xs text-zinc-500">
            {name[0]?.toUpperCase() ?? "?"}
          </div>
        )}

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white">{name}</p>
          {isAnalyzing && (
            <p className="flex items-center gap-1.5 text-xs text-zinc-500">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#2dd4bf]" />
              analyzing…
            </p>
          )}
          {isFailed && (
            <p className="text-xs text-zinc-600">analysis failed</p>
          )}
          {!isAnalyzing && !isFailed && metaParts.length > 0 && (
            <p className="text-xs text-zinc-500">{metaParts.join(" · ")}</p>
          )}
          {!isAnalyzing && !isFailed && metaParts.length === 0 && (
            <p className="text-xs text-zinc-700">No data yet</p>
          )}
        </div>

        {/* Actions — relative z-index above the link overlay */}
        <div className="relative z-10">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-700 opacity-0 transition-all hover:bg-white/[0.06] hover:text-zinc-400 group-hover:opacity-100 outline-none">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {nodeStatus === "complete" && (
                <DropdownMenuItem
                  className="flex cursor-pointer items-center gap-2"
                  onClick={() => router.push(`/workspace/${workspaceId}/app/${id}`)}
                >
                  <FileText className="h-3.5 w-3.5" />
                  View report
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="flex cursor-pointer items-center gap-2 text-red-400 focus:text-red-400"
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove {name}?</DialogTitle>
            <DialogDescription>
              This will delete the analysis for this app and clear synthesized
              findings. They&apos;ll need to be regenerated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={removing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={removing}
            >
              {removing ? "Removing…" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
