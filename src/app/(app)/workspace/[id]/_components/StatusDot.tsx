export type WorkspaceStatus = "empty" | "building" | "ready";

export function StatusDot({ status }: { status: WorkspaceStatus }) {
  if (status === "building") {
    return (
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#2dd4bf]" />
        <span className="text-xs text-zinc-500">analyzing…</span>
      </span>
    );
  }
  if (status === "ready") {
    return (
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#2dd4bf]" />
        <span className="text-xs text-[#2dd4bf]">ready</span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-700" />
      <span className="text-xs text-zinc-600">empty</span>
    </span>
  );
}
