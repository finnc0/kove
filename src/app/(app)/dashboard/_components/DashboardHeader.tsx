import Link from "next/link";
import { Plus } from "lucide-react";

interface Props {
  count: number;
}

export function DashboardHeader({ count }: Props) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Your markets
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {count === 0
            ? "No markets yet"
            : `${count} market${count === 1 ? "" : "s"} in progress`}
        </p>
      </div>
      <Link
        href="/workspace/new"
        className="inline-flex items-center gap-2 rounded-xl bg-[#2dd4bf] px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-[#5eead4]"
      >
        <Plus className="h-4 w-4" />
        New market
      </Link>
    </div>
  );
}
