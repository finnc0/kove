function Bone({ className }: { className: string }) {
  return (
    <div className={["animate-pulse rounded-lg bg-zinc-800/60", className].join(" ")} />
  );
}

export function AppReportSkeleton() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Bone className="mb-6 h-3 w-36" />
        <div className="flex items-start gap-4">
          <Bone className="h-16 w-16 rounded-2xl" />
          <div className="flex flex-col gap-2">
            <Bone className="h-8 w-56" />
            <Bone className="h-4 w-40" />
            <Bone className="h-4 w-32" />
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-xl border border-white/[0.06] bg-zinc-900 p-5"
          >
            <Bone className="h-9 w-24" />
            <Bone className="h-3 w-28" />
            <Bone className="h-2.5 w-20" />
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left */}
        <div className="lg:col-span-3 space-y-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/[0.06] bg-zinc-900 p-5"
            >
              <Bone className="mb-4 h-4 w-40" />
              <div className="space-y-3">
                <Bone className="h-3 w-full" />
                <Bone className="h-3 w-[85%]" />
                <Bone className="h-3 w-[70%]" />
              </div>
            </div>
          ))}
        </div>
        {/* Right */}
        <div className="lg:col-span-2 space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/[0.06] bg-zinc-900 p-5"
            >
              <Bone className="mb-4 h-4 w-32" />
              <div className="space-y-2">
                <Bone className="h-3 w-full" />
                <Bone className="h-3 w-[80%]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
