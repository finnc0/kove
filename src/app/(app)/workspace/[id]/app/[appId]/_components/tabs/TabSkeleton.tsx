function Bone({ className }: { className: string }) {
  return <div className={["animate-pulse rounded-lg bg-zinc-800/60", className].join(" ")} />;
}

export function TabSkeleton() {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
        <Bone className="mb-4 h-4 w-36" />
        <div className="space-y-2.5">
          <Bone className="h-3 w-full" />
          <Bone className="h-3 w-[88%]" />
          <Bone className="h-3 w-[72%]" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
            <Bone className="mb-4 h-4 w-32" />
            <div className="space-y-3">
              {[0, 1, 2].map((j) => (
                <div key={j} className="flex items-center justify-between gap-4 py-1">
                  <Bone className="h-3 w-24" />
                  <Bone className="h-3 w-16" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
