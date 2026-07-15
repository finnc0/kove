"use client";

import { useEffect, useRef, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { cn } from "@/lib/utils";
import { Layers, Loader2, MessageSquare } from "lucide-react";
import { FindingsView } from "./FindingsView/FindingsView";
import { NodeReportView } from "./NodeReportView/NodeReportView";
import { MOCK_NODE_REPORT } from "../../mockData";
import type { WorkspaceNode, NodeReport } from "../../mockData";

type PanelView = "findings" | "node";

interface Props {
  workspaceId: string;
  nodes: WorkspaceNode[];
  activeNodeId: string | null;
  view: PanelView;
  onViewChange: (v: PanelView) => void;
  onAddNode: () => void;
}

export function MainPanel({ workspaceId, nodes, activeNodeId, view, onViewChange, onAddNode }: Props) {
  const activeNode = nodes.find((n) => n.id === activeNodeId) ?? null;
  const analyzingNode = nodes.find((n) => n.status === "analyzing");
  const [nodeReport, setNodeReport] = useState<NodeReport | null>(null);
  const [nodeIconUrl, setNodeIconUrl] = useState<string | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const prevActiveStatusRef = useRef<string | null>(null);

  // Fetch report when the active node changes
  useEffect(() => {
    if (!activeNodeId) { setNodeReport(null); setNodeIconUrl(null); return; }
    setNodeReport(null);
    setNodeIconUrl(null);
    setLoadingReport(true);
    fetch(`/api/workspaces/${workspaceId}/nodes/${activeNodeId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        const r = data?.report;
        setNodeReport(r && typeof r.appName === "string" ? r : null);
        setNodeIconUrl(data?.iconUrl ?? null);
      })
      .catch(() => { setNodeReport(null); setNodeIconUrl(null); })
      .finally(() => setLoadingReport(false));
  }, [activeNodeId, workspaceId]);

  // Re-fetch report when the active node finishes re-analysis
  useEffect(() => {
    const currentStatus = activeNode?.status ?? null;
    const prevStatus = prevActiveStatusRef.current;
    prevActiveStatusRef.current = currentStatus;

    if (prevStatus === "analyzing" && currentStatus === "complete" && activeNodeId) {
      setNodeReport(null);
      setLoadingReport(true);
      fetch(`/api/workspaces/${workspaceId}/nodes/${activeNodeId}`)
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          const r = data?.report;
          setNodeReport(r && typeof r.appName === "string" ? r : null);
          setNodeIconUrl(data?.iconUrl ?? null);
        })
        .catch((err) => { Sentry.captureException(err); setNodeReport(null); setNodeIconUrl(null); })
        .finally(() => setLoadingReport(false));
    }
  }, [activeNode?.status, activeNodeId, workspaceId]);

  const report = nodeReport ?? MOCK_NODE_REPORT;
  const isNodeView = view === "node" && !!activeNode;

  return (
    <div className="flex flex-col h-full">

      {/* Tab bar */}
      <div className="bg-zinc-950 border-b border-white/[0.06] px-4 flex items-center h-11 sticky top-0 z-10 shrink-0">
        <button
          onClick={() => onViewChange("findings")}
          className={cn(
            "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border-b-2 transition-colors cursor-pointer",
            view === "findings"
              ? "border-white text-white font-medium"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          )}
        >
          <Layers className="w-3.5 h-3.5" />
          Findings
        </button>

        {activeNode && (
          <>
            <span className="w-px h-4 bg-white/[0.08] mx-2 shrink-0" />
            <button
              onClick={() => onViewChange("node")}
              className={cn(
                "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border-b-2 transition-colors cursor-pointer",
                view === "node"
                  ? "border-white text-white font-medium"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              )}
            >
              {nodeIconUrl ? (
                <img src={nodeIconUrl} alt="" className="w-3.5 h-3.5 rounded-[3px] object-cover shrink-0" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-[3px] bg-zinc-700 flex items-center justify-center text-[8px] font-bold text-zinc-400 shrink-0">
                  {activeNode.name[0]}
                </span>
              )}
              {activeNode.name}
            </button>
          </>
        )}
      </div>

      {/* App identity strip — only in node view */}
      {isNodeView && !loadingReport && (
        <div className="bg-zinc-900/50 border-b border-white/[0.05] px-6 py-3 shrink-0 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-800 shrink-0 flex items-center justify-center text-xs font-bold text-zinc-400">
            {nodeIconUrl
              ? <img src={nodeIconUrl} alt={report.appName} className="w-full h-full object-cover" />
              : report.appName[0]
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white leading-none truncate">{report.appName}</p>
            <div className="flex items-center gap-2.5 mt-1 flex-wrap">
              <span className="text-xs text-zinc-500">★ {report.rating}</span>
              <span className="text-zinc-700 text-xs">·</span>
              <span className="text-xs text-zinc-500">{report.reviewCount.toLocaleString()} reviews</span>
              <span className="text-zinc-700 text-xs">·</span>
              <span className="text-xs text-zinc-500">{report.category}</span>
              {report.platforms.map((p) => (
                <span key={p} className="text-xs text-zinc-600 border border-white/[0.06] rounded px-1.5 py-px">{p}</span>
              ))}
            </div>
          </div>
          <button
            onClick={() => setReviewsOpen(true)}
            className="shrink-0 flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer border border-white/[0.08] hover:border-white/[0.16] rounded-md px-2.5 py-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Reviews
          </button>
        </div>
      )}

      {/* Content */}
      <div className={cn(
        "flex-1 min-h-0",
        isNodeView ? "overflow-y-auto scrollbar-dark px-8 py-7 bg-[#0d0d0f]" : "overflow-y-auto scrollbar-dark bg-zinc-950"
      )}>
        {!isNodeView ? (
          <FindingsView
            workspaceId={workspaceId}
            nodes={nodes}
            analyzingNode={analyzingNode}
            onAddNode={onAddNode}
          />
        ) : loadingReport ? (
          <div className="flex items-center gap-2 text-zinc-600 py-8">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading report…</span>
          </div>
        ) : (
          <NodeReportView
            report={report}
            workspaceId={workspaceId}
            nodeId={activeNodeId!}
            iconUrl={nodeIconUrl}
            reviewsOpen={reviewsOpen}
            onReviewsOpenChange={setReviewsOpen}
          />
        )}
      </div>
    </div>
  );
}
