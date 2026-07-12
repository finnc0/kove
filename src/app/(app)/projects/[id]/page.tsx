"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Plus, ChevronRight, MoreHorizontal, Trash2, RefreshCw, Pencil, FileText } from "lucide-react";
import { TopBar } from "@/components/app/TopBar";
import { Badge } from "@/components/ui/badge";
import { PROJECTS, REPORTS, modeConfig, relativeDate } from "@/lib/mockData";

export default function ProjectPage() {
  const router  = useRouter();
  const params  = useParams();
  const project = PROJECTS.find((p) => p.id === params.id) ?? PROJECTS[0];

  const [name, setName]         = useState(project.name);
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName]     = useState(name);
  const [reports, setReports]   = useState(REPORTS.filter((r) => r.projectId === project.id));
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const saveName = () => { setName(draftName.trim() || name); setEditingName(false); };

  const deleteReport = (id: string) => { setReports((prev) => prev.filter((r) => r.id !== id)); setMenuOpen(null); };

  const sorted = [...reports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        crumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Projects",  href: "/projects" },
          { label: name },
        ]}
      />

      <div className="max-w-4xl mx-auto w-full px-8 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            {editingName ? (
              <input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false); }}
                className="text-2xl font-semibold bg-transparent border-b border-white/20 text-white outline-none pb-0.5 w-full max-w-sm"
                autoFocus
              />
            ) : (
              <h1
                onClick={() => { setDraftName(name); setEditingName(true); }}
                className="text-2xl font-semibold text-white cursor-text hover:text-zinc-200 transition-colors flex items-center gap-2 group"
              >
                {name}
                <Pencil className="w-4 h-4 text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h1>
            )}
            <p className="text-sm text-zinc-500 mt-1">
              {reports.length} report{reports.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => router.push("/new-analysis")}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-100 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Analysis
          </button>
        </div>

        {/* Reports list */}
        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] py-16 text-center">
            <FileText className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm font-medium text-white">No reports yet</p>
            <p className="text-xs text-zinc-600 mt-1">Run your first analysis in this project</p>
            <button
              onClick={() => router.push("/new-analysis")}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-100 transition-colors"
            >
              <Plus className="w-4 h-4" />New Analysis
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
            {sorted.map((report, i) => {
              const { label, className } = modeConfig[report.mode];
              const isLast = i === sorted.length - 1;
              return (
                <div
                  key={report.id}
                  className={`group flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-colors cursor-pointer ${!isLast ? "border-b border-white/[0.06]" : ""}`}
                  onClick={() => router.push(`/report/${report.id}`)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03]">
                      <FileText className="w-3.5 h-3.5 text-zinc-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{report.title}</p>
                      <p className="text-xs text-zinc-600 mt-0.5">{relativeDate(report.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="outline" className={`text-xs py-0 ${className}`}>{label}</Badge>

                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === report.id ? null : report.id); }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-700 hover:text-zinc-300 hover:bg-white/[0.06] transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {menuOpen === report.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpen(null); }} />
                          <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-xl border border-white/[0.08] bg-zinc-900 py-1 shadow-xl">
                            <button
                              onClick={(e) => { e.stopPropagation(); router.push(`/report/${report.id}`); }}
                              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                            >
                              <FileText className="w-3.5 h-3.5" />Open report
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); router.push("/new-analysis"); }}
                              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />Re-run
                            </button>
                            <div className="my-1 border-t border-white/[0.06]" />
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteReport(report.id); }}
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
