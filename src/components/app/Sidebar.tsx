"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plus, FolderOpen, ChevronRight, Settings } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PROJECTS, REPORTS } from "@/lib/mockData";
import { KoveLogo } from "@/components/KoveLogo";

const MOCK_USER = { name: "Alex Rivera", email: "alex@startup.com", initials: "AR" };

export function SidebarContent() {
  const pathname = usePathname();
  const router   = useRouter();
  const [open, setOpen] = useState<Record<string, boolean>>({ p1: true });

  const toggle = (id: string) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-white/[0.06]">
      {/* Wordmark + New Analysis */}
      <div className="px-5 py-4 flex-shrink-0">
        <Link href="/dashboard" aria-label="Kove Labs">
          <KoveLogo className="h-6 w-auto" />
        </Link>
        <button
          onClick={() => router.push("/new-analysis")}
          className="mt-3 flex w-full items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Analysis
        </button>
      </div>

      {/* Projects list */}
      <div className="flex-1 overflow-y-auto pt-2 pb-2">
        <p className="text-xs font-medium text-zinc-700 uppercase tracking-widest px-5 mt-4 mb-2">
          Projects
        </p>

        {PROJECTS.length === 0 ? (
          <p className="text-xs text-zinc-700 px-5">No projects yet</p>
        ) : (
          PROJECTS.map((project) => {
            const reports     = REPORTS.filter((r) => r.projectId === project.id);
            const isProjectActive = pathname === `/projects/${project.id}`;

            return (
              <Collapsible key={project.id} open={open[project.id] ?? false} onOpenChange={() => toggle(project.id)}>
                <CollapsibleTrigger className="flex w-full items-center justify-between px-5 py-1.5 text-sm text-zinc-500 hover:bg-white/[0.04] hover:text-white transition-colors">
                  <span className="flex items-center gap-2">
                    <FolderOpen className="w-[14px] h-[14px] text-zinc-600 flex-shrink-0" />
                    <span className={isProjectActive || open[project.id] ? "text-white font-medium" : ""}>
                      {project.name}
                    </span>
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 text-zinc-600 transition-transform ${open[project.id] ? "rotate-90" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {reports.map((report) => {
                    const isActive = pathname === `/report/${report.id}`;
                    return (
                      <Link
                        key={report.id}
                        href={`/report/${report.id}`}
                        className={`block pl-9 pr-5 py-1 text-xs truncate transition-colors ${
                          isActive ? "text-white font-medium" : "text-zinc-600 hover:text-zinc-300"
                        }`}
                      >
                        {report.title}
                      </Link>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          })
        )}
      </div>

      {/* User row */}
      <div className="border-t border-white/[0.06] px-4 py-4 flex items-center gap-3 flex-shrink-0">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="text-xs bg-white/[0.08] text-zinc-300">
            {MOCK_USER.initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{MOCK_USER.name}</p>
          <p className="text-xs text-zinc-500 truncate">{MOCK_USER.email}</p>
        </div>
        <Link href="/settings" className="text-zinc-600 hover:text-zinc-300 transition-colors flex-shrink-0">
          <Settings className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
