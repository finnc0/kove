"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NodePanel } from "./NodePanel/NodePanel";
import { MainPanel } from "./MainPanel/MainPanel";
import { AddNodeModal } from "./AddNodeModal/AddNodeModal";
import type { WorkspaceNode } from "../mockData";

type PanelView = "findings" | "node";
type MobileTab = "nodes" | "findings";

interface Props {
  workspaceId: string;
  initialNodes: WorkspaceNode[];
}

export function CanvasLayout({ workspaceId, initialNodes }: Props) {
  const [nodes, setNodes] = useState<WorkspaceNode[]>(initialNodes);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [panelView, setPanelView] = useState<PanelView>("findings");
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("findings");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll for status updates every 3 seconds when any node is analyzing
  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/status`);
      if (!res.ok) return;
      const data = await res.json();
      setNodes(data.nodes.map((n: { id: string; name: string | null; status: string; platform: string[]; iconUrl: string | null }) => ({
        id: n.id,
        name: n.name ?? "Untitled",
        url: "",
        platform: n.platform ?? [],
        status: n.status as WorkspaceNode["status"],
        addedAt: "",
        iconUrl: n.iconUrl,
      })));
    } catch {}
  }, [workspaceId]);

  useEffect(() => {
    const hasAnalyzing = nodes.some((n) => n.status === "analyzing" || n.status === "pending");
    if (hasAnalyzing) {
      pollRef.current = setInterval(poll, 3000);
    } else {
      if (pollRef.current) clearInterval(pollRef.current);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [nodes, poll]);

  function handleSelectNode(id: string) {
    setActiveNodeId(id);
    setPanelView("node");
    setMobileTab("findings");
  }

  function handleNodeAdded(newNode: WorkspaceNode) {
    setNodes((prev) =>
      prev.some((n) => n.id === newNode.id)
        ? prev.map((n) => (n.id === newNode.id ? newNode : n))
        : [...prev, newNode]
    );
    // Immediately sync from DB so the node list has full data (name, icon, etc.)
    poll();
    // Auto-select the completed node and show its report
    if (newNode.status === "complete") {
      setActiveNodeId(newNode.id);
      setPanelView("node");
      setMobileTab("findings");
    }
  }

  async function handleNodeRemoved(nodeId: string) {
    await fetch(`/api/workspaces/${workspaceId}/nodes/${nodeId}`, { method: "DELETE" });
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    if (activeNodeId === nodeId) {
      setActiveNodeId(null);
      setPanelView("findings");
    }
  }

  function handleReanalyze(nodeId: string) {
    // Optimistically mark as analyzing so polling kicks in and NodeCard shows progress
    setNodes((prev) =>
      prev.map((n) => n.id === nodeId ? { ...n, status: "analyzing" as const } : n)
    );

    // Drain the SSE stream so the server runs the full analysis to completion
    (async () => {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/nodes/${nodeId}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const reader = res.body?.getReader();
        if (!reader) return;
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done } = await reader.read();
          if (done) break;
        }
      } catch (e) {
        console.error("[reanalyze]", e);
      } finally {
        // Sync DB state once the stream closes
        poll();
      }
    })();
  }

  return (
    <>
      {/* Mobile tab switcher */}
      <div className="md:hidden flex border-b border-white/[0.06] bg-zinc-950">
        {(["findings", "nodes"] as MobileTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 py-2.5 text-sm capitalize transition-colors border-b-2 ${
              mobileTab === tab ? "border-white text-white font-medium" : "border-transparent text-zinc-500"
            }`}
          >
            {tab === "findings" ? "Findings" : "Apps & Sites"}
          </button>
        ))}
      </div>

      <div className="flex h-[calc(100vh-100px)]">
        <aside className={`${mobileTab === "nodes" ? "flex" : "hidden"} md:flex w-full md:w-[280px] shrink-0 border-r border-white/[0.06] bg-zinc-950 flex-col`}>
          <NodePanel
            nodes={nodes}
            activeNodeId={activeNodeId}
            onSelectNode={handleSelectNode}
            onAddNode={() => setModalOpen(true)}
            onRemoveNode={handleNodeRemoved}
            onReanalyzeNode={handleReanalyze}
          />
        </aside>

        <main className={`${mobileTab === "findings" ? "flex" : "hidden"} md:flex flex-1 bg-zinc-950 flex-col overflow-hidden`}>
          <MainPanel
            workspaceId={workspaceId}
            nodes={nodes}
            activeNodeId={activeNodeId}
            view={panelView}
            onViewChange={(v) => {
              setPanelView(v);
              if (v === "findings") setActiveNodeId(null);
            }}
            onAddNode={() => setModalOpen(true)}
          />
        </main>
      </div>

      <AddNodeModal
        workspaceId={workspaceId}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onNodeAdded={handleNodeAdded}
      />
    </>
  );
}
