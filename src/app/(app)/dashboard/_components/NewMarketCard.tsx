import Link from "next/link";
import { Plus } from "lucide-react";

export function NewMarketCard() {
  return (
    <Link
      href="/workspace/new"
      className="group flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/[0.06] p-6 transition-all duration-150 hover:border-white/[0.14]"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] transition-colors group-hover:border-[#2dd4bf]/30">
        <Plus className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-[#2dd4bf]" />
      </div>
      <p className="text-sm font-medium text-zinc-600 transition-colors group-hover:text-zinc-400">
        New market
      </p>
    </Link>
  );
}
