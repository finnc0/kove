import type { WorkspaceStatus } from "./WorkspaceCard";

interface Props {
  status: WorkspaceStatus;
}

export function StatusDot({ status }: Props) {
  if (status === "building") {
    return (
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4bf] animate-pulse" />
        <span className="text-xs text-zinc-500">analyzing…</span>
      </div>
    );
  }
  if (status === "ready") {
    return (
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4bf]" />
        <span className="text-xs text-[#2dd4bf]">ready</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
      <span className="text-xs text-zinc-600">no apps yet</span>
    </div>
  );
}
