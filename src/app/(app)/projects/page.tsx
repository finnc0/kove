"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, FolderOpen, ChevronRight, MoreHorizontal, Trash2, Pencil } from "lucide-react";
import { TopBar } from "@/components/app/TopBar";
import { Badge } from "@/components/ui/badge";
import { PROJECTS, REPORTS, modeConfig, relativeDate } from "@/lib/mockData";

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects]     = useState(PROJECTS);
  const [menuOpen, setMenuOpen]     = useState<string | null>(null);
  const [renaming, setRenaming]     = useState<string | null>(null);
  const [draftName, setDraftName]   = useState("");

  const saveRename = (id: string) => {
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, name: draftName.trim() || p.name } : p));
    setRenaming(null);
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setMenuOpen(null);
  };

  return (
    <div className="flex flex-col min-h-full">
      <TopBar crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Projects" }]} />

      <div className="max-w-4xl mx-auto w-full px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white">Projects</h1>
            <p className="text-sm text-zinc-500 mt-1">All your research workspaces</p>
          </div>
          <button
            onClick={() => router.push("/new-analysis")}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Analysis
          </button>
        </div>

        <div className="space-y-3">
          {projects.map((project) => {
            const reports = REPORTS.filter((r) => r.projectId === project.id);
            const latest  = reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

            return (
              <div
                key={project.id}
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.03] hover:border-white/[0.1] transition-all cursor-pointer"
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
                      <FolderOpen className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {renaming === project.id ? (
                        <input
                          value={draftName}
                          onChange={(e) => setDraftName(e.target.value)}
                          onBlur={() => saveRename(project.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveRename(project.id);
                            if (e.key === "Escape") setRenaming(null);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-white/[0.06] border border-white/[0.1] rounded-lg px-2 py-0.5 text-sm font-medium text-white outline-none w-full max-w-xs"
                          autoFocus
                        />
                      ) : (
                        <p className="text-sm font-medium text-white truncate">{project.name}</p>
                      )}
                      <p className="text-xs text-zinc-600 mt-0.5">
                        {reports.length} report{reports.length !== 1 ? "s" : ""}
                        {latest && ` · Last updated ${relativeDate(latest.createdAt)}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Latest mode badges */}
                    <div className="hidden sm:flex items-center gap-1.5">
                      {Array.from(new Set(reports.map((r) => r.mode))).map((m) => (
                        <Badge key={m} variant="outline" className={`text-xs py-0 ${modeConfig[m].className}`}>
                          {modeConfig[m].label}
                        </Badge>
                      ))}
                    </div>

                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === project.id ? null : project.id); }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.06] transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {menuOpen === project.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpen(null); }} />
                          <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-xl border border-white/[0.08] bg-zinc-900 py-1 shadow-xl">
                            <button
                              onClick={(e) => { e.stopPropagation(); setDraftName(project.name); setRenaming(project.id); setMenuOpen(null); }}
                              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                            >
                              <Pencil className="w-3.5 h-3.5" />Rename
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    <ChevronRight className="w-4 h-4 text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            );
          })}

          {projects.length === 0 && (
            <div className="rounded-2xl border border-white/[0.06] py-16 text-center">
              <FolderOpen className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm font-medium text-white">No projects yet</p>
              <p className="text-xs text-zinc-600 mt-1">Run your first analysis to create one</p>
              <button
                onClick={() => router.push("/new-analysis")}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-100 transition-colors"
              >
                <Plus className="w-4 h-4" />New Analysis
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
