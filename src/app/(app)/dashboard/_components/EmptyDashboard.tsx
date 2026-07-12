import Link from "next/link";
import { LayoutGrid, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyDashboard() {
  return (
    <div className="py-24 flex flex-col items-center">
      <LayoutGrid className="w-10 h-10 text-zinc-700" />
      <h2 className="text-base font-medium text-white mt-5 text-center">No workspaces yet</h2>
      <p className="text-sm text-zinc-500 text-center mt-2 max-w-sm mx-auto leading-relaxed">
        Create a workspace for any app niche and start building your research canvas
      </p>
      <Link
        href="/workspace/new"
        className={cn(
          buttonVariants({ variant: "default" }),
          "mt-8 bg-white hover:bg-zinc-100 text-zinc-900 text-sm font-medium gap-1.5"
        )}
      >
        <Plus className="w-4 h-4" />
        Create your first workspace
      </Link>
    </div>
  );
}
