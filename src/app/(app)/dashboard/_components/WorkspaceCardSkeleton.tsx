export function WorkspaceCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/[0.06] bg-zinc-900 p-6">
      {/* Name + status row */}
      <div className="mb-5 flex items-center justify-between">
        <div className="h-4 w-40 rounded-md bg-zinc-800" />
        <div className="h-3 w-14 rounded-md bg-zinc-800" />
      </div>
      {/* Avatars */}
      <div className="mb-3 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-7 w-7 rounded-lg bg-zinc-800" />
        ))}
      </div>
      {/* Stats */}
      <div className="mb-5 h-3 w-36 rounded-md bg-zinc-800" />
      {/* Footer */}
      <div className="border-t border-white/[0.04] pt-4 flex items-center justify-between">
        <div className="h-3 w-20 rounded-md bg-zinc-800" />
        <div className="h-3 w-24 rounded-md bg-zinc-800" />
      </div>
    </div>
  );
}
