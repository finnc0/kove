"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NotebookPen, RefreshCw, Download, ChevronDown, FileText, File, Copy, Link } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { ReportMode } from "./mockData";

const modeConfig: Record<ReportMode, { label: string; className: string }> = {
  market: { label: "Market Research", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  app:    { label: "App Analysis",    className: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  sweep:  { label: "Full Sweep",      className: "bg-teal-500/10 text-teal-400 border-teal-500/20" },
};

function relativeDate(iso: string) {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 36e5);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "Yesterday" : `${d} days ago`;
}

function absoluteDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface ReportTopBarProps {
  title: string;
  mode: ReportMode;
  generatedAt: string;
  notesOpen: boolean;
  onNotesToggle: () => void;
  onTitleChange: (v: string) => void;
}

export function ReportTopBar({ title, mode, generatedAt, notesOpen, onNotesToggle, onTitleChange }: ReportTopBarProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const [exportOpen, setExportOpen] = useState(false);
  const [rerunConfirm, setRerunConfirm] = useState(false);
  const { label, className } = modeConfig[mode];

  const saveTitle = () => { onTitleChange(draft.trim() || title); setEditing(false); };

  const handleExport = (type: "md" | "pdf" | "copy" | "share") => {
    setExportOpen(false);
    if (type === "md") {
      const blob = new Blob([`# ${title}\n\nExported from Kove`], { type: "text/markdown" });
      const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `${title.toLowerCase().replace(/\s+/g, "-")}.md` });
      a.click(); URL.revokeObjectURL(a.href);
    }
    if (type === "copy") navigator.clipboard.writeText(`# ${title}\n\nReport from Kove`);
    if (type === "share") navigator.clipboard.writeText(window.location.href);
    if (type === "pdf") console.log("PDF export — coming soon");
  };

  return (
    <div className="mb-10 flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        {editing ? (
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") { setDraft(title); setEditing(false); } }}
            className="text-2xl font-semibold h-auto py-1 max-w-lg"
            autoFocus
          />
        ) : (
          <h1
            onClick={() => { setDraft(title); setEditing(true); }}
            className="text-2xl font-semibold text-white cursor-text hover:text-zinc-200 transition-colors"
            title="Click to rename"
          >
            {title}
          </h1>
        )}
        <div className="flex items-center gap-3 mt-2">
          <Badge variant="outline" className={`text-xs ${className}`}>{label}</Badge>
          <span className="text-xs text-zinc-600">
            Generated {relativeDate(generatedAt)} · {absoluteDate(generatedAt)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 mt-1">
        <button
          onClick={onNotesToggle}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
            notesOpen
              ? "border-white/20 bg-white/[0.08] text-white"
              : "border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.06]"
          }`}
        >
          <NotebookPen className="w-3.5 h-3.5" />
          Notes
        </button>

        {rerunConfirm ? (
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-sm">
            <span className="text-xs text-zinc-400">Replace report?</span>
            <button onClick={() => { setRerunConfirm(false); router.push("/new-analysis"); }} className="text-xs font-medium text-zinc-400 hover:text-zinc-200">Yes</button>
            <button onClick={() => setRerunConfirm(false)} className="text-xs text-zinc-600 hover:text-zinc-300">Cancel</button>
          </div>
        ) : (
          <button
            onClick={() => setRerunConfirm(true)}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-sm text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Re-run
          </button>
        )}

        <div className="relative">
          <button
            onClick={() => setExportOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-zinc-950 hover:bg-zinc-100 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {exportOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
              <div className="absolute right-0 top-full mt-1.5 z-20 w-52 rounded-xl border border-white/[0.08] bg-zinc-900 shadow-xl py-1">
                {([["md", FileText, "Export as Markdown"], ["pdf", File, "Export as PDF"], ["copy", Copy, "Copy to clipboard"]] as const).map(([id, Icon, lbl]) => (
                  <button key={id} onClick={() => handleExport(id)} className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-zinc-400 hover:bg-white/[0.04] hover:text-white">
                    <Icon className="w-4 h-4 text-zinc-600" />{lbl}
                  </button>
                ))}
                <div className="my-1 border-t border-white/[0.06]" />
                <button onClick={() => handleExport("share")} className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-zinc-400 hover:bg-white/[0.04] hover:text-white">
                  <Link className="w-4 h-4 text-zinc-600" />Share link
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
