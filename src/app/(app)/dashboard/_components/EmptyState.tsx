import Link from "next/link";
import { Plus } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center py-32 text-center">
      {/* Faint dot motif */}
      <div className="mb-10 opacity-[0.18]">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden>
          {[0, 1, 2, 3].map((row) =>
            [0, 1, 2, 3].map((col) => (
              <circle
                key={`${row}-${col}`}
                cx={col * 20 + 10}
                cy={row * 20 + 10}
                r={1.5}
                fill="#3f3f46"
              />
            )),
          )}
        </svg>
      </div>

      <h2 className="mb-3 text-2xl font-semibold text-white">
        Research your first market.
      </h2>
      <p className="mb-8 max-w-sm text-base leading-relaxed text-zinc-400">
        Create a workspace for the niche you&apos;re exploring.
      </p>
      <Link
        href="/workspace/new"
        className="inline-flex items-center gap-2 rounded-xl bg-[#2dd4bf] px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-[#5eead4]"
      >
        <Plus className="h-4 w-4" />
        New market
      </Link>
      <p className="mt-4 text-xs text-zinc-700">Takes about 2 minutes.</p>
    </div>
  );
}
