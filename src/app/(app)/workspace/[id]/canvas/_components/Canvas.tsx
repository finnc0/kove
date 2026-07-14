"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  type OnNodesChange,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

import { CompetitorNode } from "./CompetitorNode";
import { GapNode } from "./GapNode";
import { AddAppNode } from "./AddAppNode";
import { NodeDetailPanel } from "./NodeDetailPanel";
import { CanvasTopBar } from "./CanvasTopBar";
import { CanvasToolbar } from "./CanvasToolbar";
import { ZoomControls } from "./ZoomControls";
import { StickyNote } from "./tools/StickyNote";
import { CanvasNoteContext } from "./CanvasNoteContext";
import { GroupContainer } from "./groups/GroupContainer";
import type { GroupContainerData, ContainerColor } from "./groups/GroupContainer";
import { computeContainerHeight, CONTAINER_W } from "./groups/snapLayout";
import { ComparePanel } from "./ComparePanel";
import { IdeaNode } from "./idea/IdeaNode";
import type { IdeaNodeData } from "./idea/IdeaNode";
import { IdeaBreakdownPanel } from "./idea/IdeaBreakdownPanel";
import type { IdeaEvaluation } from "@/app/api/workspaces/[id]/idea/evaluate/route";
import { PaywallModal } from "@/components/paywall/PaywallModal";
import { AddNodeModal } from "../../_components/AddNodeModal/AddNodeModal";
import { CanvasStoreProvider, useCanvasStore } from "../_store/canvasStore";
import { useCanvasShortcuts } from "../_hooks/useCanvasShortcuts";
import type { CanvasAppNode, CanvasGapInfo } from "./types";
import type { WorkspaceNode } from "../../mockData";

// ─── node types ───────────────────────────────────────────────────────────────
const nodeTypes: NodeTypes = {
  competitor: CompetitorNode,
  gap: GapNode,
  addApp: AddAppNode,
  note: StickyNote,
  group: GroupContainer,
  idea: IdeaNode,
};

// ─── persist drag positions in-memory ────────────────────────────────────────
const _savedPositions = new Map<string, { x: number; y: number }>();

// ─── layout helpers ───────────────────────────────────────────────────────────
function circlePositions(ids: string[], cx = 500, cy = 360) {
  const result = new Map<string, { x: number; y: number }>();
  const n = ids.length;
  if (n === 0) return result;
  const radius = Math.max(260, n * 80);
  ids.forEach((id, i) => {
    const angle = ((2 * Math.PI) / n) * i - Math.PI / 2;
    result.set(id, {
      x: cx + radius * Math.cos(angle) - 120,
      y: cy + radius * Math.sin(angle) - 80,
    });
  });
  return result;
}

function buildNodes(
  appNodes: CanvasAppNode[],
  gap: CanvasGapInfo | null,
  positions: Map<string, { x: number; y: number }>,
  dimmedIds: string[],
  allNodes?: CanvasAppNode[],
  onRefreshGap?: () => void,
): Node[] {
  const nodes: Node[] = [];
  if (appNodes.length === 0 && (!allNodes || allNodes.length === 0)) {
    nodes.push({ id: "add-app", type: "addApp", position: { x: 300, y: 260 }, data: {} });
    return nodes;
  }
  const completedCount = (allNodes ?? appNodes).filter((n) => n.nodeStatus === "complete").length;
  const gapReady = gap !== null && completedCount >= 3;
  nodes.push({
    id: "gap-node",
    type: "gap",
    position: positions.get("gap-node") ?? { x: 440, y: 340 },
    data: {
      gapTitle: gap?.title ?? "",
      opportunity: gap?.opportunity ?? "",
      appCount: completedCount,
      ready: gapReady,
      needed: Math.max(0, 3 - completedCount),
      onRefresh: gapReady ? onRefreshGap : undefined,
      refreshing: false,
    },
  });
  appNodes.forEach((n) => {
    nodes.push({
      id: n.id,
      type: "competitor",
      position: positions.get(n.id) ?? { x: 0, y: 0 },
      style: dimmedIds.includes(n.id) ? { opacity: 0.3, transition: "opacity 0.2s" } : undefined,
      data: { ...n },
    });
  });
  return nodes;
}

function buildEdges(appNodes: CanvasAppNode[], gap: CanvasGapInfo | null): Edge[] {
  const edges: Edge[] = [];
  const completedNodes = appNodes.filter((n) => n.nodeStatus === "complete");
  const painGroups = new Map<string, string[]>();
  completedNodes.forEach((n) => {
    if (n.topPainTitle) {
      const g = painGroups.get(n.topPainTitle) ?? [];
      g.push(n.id);
      painGroups.set(n.topPainTitle, g);
    }
  });
  const added = new Set<string>();
  painGroups.forEach((ids) => {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const key = [ids[i], ids[j]].sort().join("||");
        if (!added.has(key)) {
          added.add(key);
          edges.push({
            id: `pain-${key}`,
            source: ids[i],
            target: ids[j],
            type: "straight",
            style: { stroke: "#3f3f46", strokeWidth: 1, strokeOpacity: 0.7 },
          });
        }
      }
    }
  });
  if (gap && completedNodes.length >= 3) {
    completedNodes.forEach((n) => {
      edges.push({
        id: `gap-${n.id}`,
        source: "gap-node",
        target: n.id,
        type: "straight",
        style: { stroke: "#2dd4bf", strokeWidth: 1, strokeOpacity: 0.3 },
      });
    });
  }
  return edges;
}

// ─── debounced position save ──────────────────────────────────────────────────
const DB_NODES = new Set<string>();

function usePersistPosition(workspaceId: string) {
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  return useCallback(
    (nodeId: string, x: number, y: number) => {
      if (!DB_NODES.has(nodeId)) return;
      const existing = timers.current.get(nodeId);
      if (existing) clearTimeout(existing);
      timers.current.set(
        nodeId,
        setTimeout(() => {
          timers.current.delete(nodeId);
          fetch(`/api/workspaces/${workspaceId}/nodes/${nodeId}/position`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ x, y }),
          }).catch(() => {});
        }, 600),
      );
    },
    [workspaceId],
  );
}

// ─── types ────────────────────────────────────────────────────────────────────
export interface InitialNote {
  noteId: string;
  text: string;
  x: number;
  y: number;
  pinnedToNodeId?: string | null;
}

export interface InitialGroup {
  groupId: string;
  label: string;
  color: string;
  memberIds: string[];
  x: number;
  y: number;
  collapsed: boolean;
}

export interface InitialIdea {
  ideaId: string;
  text: string;
  targetUser: string | null;
  keyFeature: string | null;
  verdict: "strong" | "partial" | "crowded" | null;
  evaluation: IdeaEvaluation | null;
  lastEvaluatedAt: string | null;
  x: number;
  y: number;
}

interface Props {
  workspaceId: string;
  workspaceName: string;
  appNodes: CanvasAppNode[];
  gap: CanvasGapInfo | null;
  initialPositions: Record<string, { x: number; y: number }>;
  initialNotes?: InitialNote[];
  initialGroups?: InitialGroup[];
  initialIdeas?: InitialIdea[];
  latestCompetitorAt: string | null;
  isProUser?: boolean;
}

export function Canvas(props: Props) {
  return (
    <CanvasStoreProvider>
      <CanvasContent {...props} />
    </CanvasStoreProvider>
  );
}

// ─── drag-over tracking ───────────────────────────────────────────────────────
const CATCH_MARGIN = 30;

function CanvasContent({
  workspaceId,
  workspaceName,
  appNodes,
  gap,
  initialPositions,
  initialNotes = [],
  initialGroups = [],
  initialIdeas = [],
  latestCompetitorAt,
  isProUser = false,
}: Props) {
  const router = useRouter();
  const rfRef = useRef<ReactFlowInstance | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [breakdownIdeaId, setBreakdownIdeaId] = useState<string | null>(null);
  const [ideaPaywallOpen, setIdeaPaywallOpen] = useState(false);
  const dragOverGroupRef = useRef<string | null>(null);
  const [liveGap, setLiveGap] = useState<CanvasGapInfo | null>(gap);
  const [gapRefreshing, setGapRefreshing] = useState(false);

  const { state, setTool, selectNode, deselectAll } = useCanvasStore();
  useCanvasShortcuts({ rfInstance: rfRef.current });

  const isPanMode = state.activeTool === "pan";
  const completedCount = appNodes.filter((n) => n.nodeStatus === "complete").length;

  // ─── position seeding ─────────────────────────────────────────────────────
  const nodeIds = appNodes.map((n) => n.id);
  const autoPositions = circlePositions(nodeIds);

  nodeIds.forEach((id) => {
    DB_NODES.add(id);
    if (!_savedPositions.has(id)) {
      _savedPositions.set(id, initialPositions[id] ?? autoPositions.get(id) ?? { x: 0, y: 0 });
    }
  });
  if (appNodes.length > 0 && !_savedPositions.has("gap-node")) {
    _savedPositions.set("gap-node", { x: 440, y: 340 });
  }
  for (const idea of initialIdeas) {
    const key = `idea-${idea.ideaId}`;
    if (!_savedPositions.has(key)) _savedPositions.set(key, { x: idea.x, y: idea.y });
  }

  // ─── stable callback refs ─────────────────────────────────────────────────
  const gapRefreshRef = useRef<() => void>(() => {});

  const ideaHandlersRef = useRef<{
    onEvaluated: (ideaId: string, ev: IdeaEvaluation) => void;
    onSave: (ideaId: string, f: { text?: string; targetUser?: string; keyFeature?: string }) => Promise<void>;
    onDelete: (ideaId: string) => void;
  }>({ onEvaluated: () => {}, onSave: () => Promise.resolve(), onDelete: () => {} });

  const groupHandlersRef = useRef<{
    onLabelChange: (groupId: string, label: string) => void;
    onColorChange: (groupId: string, color: ContainerColor) => void;
    onCollapse: (groupId: string) => void;
    onUngroup: (groupId: string) => void;
    onDelete: (groupId: string) => void;
    onNodeEject: (groupId: string, nodeId: string, screenPos: { x: number; y: number }) => void;
    onMemberClick: (nodeId: string) => void;
  }>({
    onLabelChange: () => {},
    onColorChange: () => {},
    onCollapse: () => {},
    onUngroup: () => {},
    onDelete: () => {},
    onNodeEject: () => {},
    onMemberClick: () => {},
  });

  // ─── idea → group member conversion ──────────────────────────────────────
  function ideaToMember(idea: {
    ideaId: string; text: string; targetUser: string | null; keyFeature: string | null;
    verdict: "strong" | "partial" | "crowded" | null; evaluation: unknown;
    lastEvaluatedAt: string | null; x: number; y: number;
  }): CanvasAppNode {
    return {
      id: idea.ideaId,
      name: (idea.text || "Untitled idea").slice(0, 60),
      category: null, iconUrl: null, nodeStatus: "complete", groupId: null,
      rating: null, downloadsFormatted: null, revenueFormatted: null,
      rawDownloads: 0, rawRevenue: 0, primaryPrice: null, acquisitionTier: null,
      topPainTitle: null, topPainSeverity: null, confidence: null, report: null,
      memberType: "idea",
      ideaText: idea.text,
      ideaVerdict: idea.verdict,
      ideaEvaluation: idea.evaluation,
      ideaTargetUser: idea.targetUser,
      ideaKeyFeature: idea.keyFeature,
      ideaLastEvaluatedAt: idea.lastEvaluatedAt,
    };
  }

  // ─── group node builder ───────────────────────────────────────────────────
  function makeGroupNode(
    groupId: string,
    label: string,
    color: string,
    members: CanvasAppNode[],
    x: number,
    y: number,
    collapsed: boolean,
  ): Node {
    const safeColor = (color in { zinc: 1, teal: 1, amber: 1, violet: 1 } ? color : "zinc") as ContainerColor;
    const initH = collapsed ? 56 : Math.max(computeContainerHeight(members.length, false), 300);
    const initW = Math.max(CONTAINER_W, 420);
    return {
      id: `group-${groupId}`,
      type: "group" as const,
      position: { x, y },
      style: {
        width: initW,
        height: initH,
        zIndex: 10,
        background: "transparent",
        border: "none",
        boxShadow: "none",
        padding: 0,
      },
      data: {
        groupId,
        label,
        color: safeColor,
        members,
        collapsed,
        dragOver: false,
        onLabelChange: (id: string, lbl: string) => groupHandlersRef.current.onLabelChange(id, lbl),
        onColorChange: (id: string, col: ContainerColor) => groupHandlersRef.current.onColorChange(id, col),
        onCollapse: (id: string) => groupHandlersRef.current.onCollapse(id),
        onUngroup: (id: string) => groupHandlersRef.current.onUngroup(id),
        onDelete: (id: string) => groupHandlersRef.current.onDelete(id),
        onNodeEject: (gId: string, nId: string, pos: { x: number; y: number }) =>
          groupHandlersRef.current.onNodeEject(gId, nId, pos),
        onMemberClick: (nId: string) => groupHandlersRef.current.onMemberClick(nId),
      } as unknown as GroupContainerData,
      selectable: true,
      draggable: true,
    };
  }

  // ─── build helpers ────────────────────────────────────────────────────────
  function buildIdeaEdgesFromEvaluation(ideaId: string, evaluation: IdeaEvaluation | null): Edge[] {
    if (!evaluation) return [];
    const rfId = `idea-${ideaId}`;
    const edges: Edge[] = [];
    if (evaluation.gaps_filled.some((g) => g.matched)) {
      edges.push({
        id: `${rfId}-to-gap`,
        source: rfId,
        target: "gap-node",
        type: "straight",
        style: { stroke: "#2dd4bf", strokeWidth: 1.5, strokeOpacity: 0.35 },
      });
    }
    for (const overlap of evaluation.overlaps) {
      if (!overlap?.competitor) continue;
      const name = overlap.competitor.toLowerCase();
      const comp = appNodes.find(
        (n) => n.name.toLowerCase().includes(name) || name.includes(n.name.toLowerCase()),
      );
      if (comp) {
        edges.push({
          id: `${rfId}-overlap-${comp.id}`,
          source: rfId,
          target: comp.id,
          type: "straight",
          style: { stroke: "#2dd4bf", strokeWidth: 1, strokeOpacity: 0.28, strokeDasharray: "4 3" },
        });
      }
    }
    return edges;
  }

  function buildIdeaRFNode(
    idea: {
      ideaId: string;
      text?: string;
      targetUser?: string | null;
      keyFeature?: string | null;
      verdict?: "strong" | "partial" | "crowded" | null;
      evaluation?: IdeaEvaluation | null;
      lastEvaluatedAt?: string | null;
      x: number;
      y: number;
    },
    animateIn = false,
  ): Node {
    const rfId = `idea-${idea.ideaId}`;
    return {
      id: rfId,
      type: "idea" as const,
      position: _savedPositions.get(rfId) ?? { x: idea.x, y: idea.y },
      data: {
        workspaceId,
        ideaId: idea.ideaId,
        text: idea.text ?? "",
        targetUser: idea.targetUser ?? null,
        keyFeature: idea.keyFeature ?? null,
        verdict: idea.verdict ?? null,
        evaluation: idea.evaluation ?? null,
        lastEvaluatedAt: idea.lastEvaluatedAt ?? null,
        competitorCount: completedCount,
        latestCompetitorAt,
        animateIn,
        onEvaluated: (ev: IdeaEvaluation) => ideaHandlersRef.current.onEvaluated(idea.ideaId, ev),
        onSave: (f: { text?: string; targetUser?: string; keyFeature?: string }) =>
          ideaHandlersRef.current.onSave(idea.ideaId, f),
        onOpenBreakdown: () => setBreakdownIdeaId(idea.ideaId),
        onDelete: () => ideaHandlersRef.current.onDelete(idea.ideaId),
      } as unknown as IdeaNodeData,
      draggable: true,
    };
  }

  function buildNoteNodes(notes: InitialNote[]): Node[] {
    return notes.map((n) => ({
      id: `note-${n.noteId}`,
      type: "note" as const,
      position: { x: n.x, y: n.y },
      data: { noteId: n.noteId, text: n.text, pinnedToNodeId: n.pinnedToNodeId ?? null, animateIn: false },
      draggable: true,
    }));
  }

  // ─── initial state ────────────────────────────────────────────────────────
  const appNodeMap = new Map(appNodes.map((n) => [n.id, n]));
  const ideaMap = new Map(initialIdeas.map((i) => [i.ideaId, i]));

  // memberIds may contain "idea:${ideaId}" prefixed entries
  function resolveGroupMember(rawId: string): CanvasAppNode | null {
    if (rawId.startsWith("idea:")) {
      const ideaId = rawId.slice(5);
      const idea = ideaMap.get(ideaId);
      if (!idea) return null;
      return ideaToMember(idea);
    }
    return appNodeMap.get(rawId) ?? null;
  }

  const initialGroupedCompetitorIds = new Set(
    initialGroups.flatMap((g) => g.memberIds.filter((id) => !id.startsWith("idea:"))),
  );
  const initialGroupedIdeaIds = new Set(
    initialGroups.flatMap((g) =>
      g.memberIds.filter((id) => id.startsWith("idea:")).map((id) => id.slice(5)),
    ),
  );

  const freeInitialNodes = appNodes.filter((n) => !initialGroupedCompetitorIds.has(n.id));
  const freeInitialIdeas = initialIdeas.filter((i) => !initialGroupedIdeaIds.has(i.ideaId));

  const initialAppNodes = buildNodes(freeInitialNodes, gap, _savedPositions, state.dimmedNodeIds, appNodes, () => gapRefreshRef.current());
  const initialNoteNodes = buildNoteNodes(initialNotes);
  const initialGroupNodes = initialGroups.map((g) =>
    makeGroupNode(
      g.groupId, g.label, g.color,
      g.memberIds.map(resolveGroupMember).filter(Boolean) as CanvasAppNode[],
      g.x, g.y, g.collapsed,
    ),
  );
  const initialIdeaNodes = freeInitialIdeas.map((idea) => buildIdeaRFNode(idea, false));

  const [nodes, setNodes, onNodesChange] = useNodesState([
    ...initialGroupNodes,
    ...initialAppNodes,
    ...initialNoteNodes,
    ...initialIdeaNodes,
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([
    ...buildEdges(freeInitialNodes, gap),
    ...freeInitialIdeas.flatMap((idea) => buildIdeaEdgesFromEvaluation(idea.ideaId, idea.evaluation)),
  ]);

  // ─── sync when server data changes ────────────────────────────────────────
  const nodeIdsKey = [...nodeIds].sort().join(",");
  const statusKey = appNodes.map((n) => n.nodeStatus).join(",");

  useEffect(() => {
    setNodes((prev) => {
      // Get currently grouped IDs from existing containers
      const groupedIds = new Set(
        prev
          .filter((n) => n.type === "group")
          .flatMap((n) => (n.data as unknown as GroupContainerData).members.map((m) => m.id)),
      );
      const freeNodes = appNodes.filter((n) => !groupedIds.has(n.id));
      const newAppNodes = buildNodes(freeNodes, liveGap, _savedPositions, state.dimmedNodeIds, appNodes, () => gapRefreshRef.current());

      // Refresh member data in containers (in case names/stats changed)
      const latestMap = new Map(appNodes.map((n) => [n.id, n]));
      const others = prev
        .filter((n) => n.type !== "competitor" && n.type !== "gap" && n.type !== "addApp")
        .map((n) => {
          if (n.type !== "group") return n;
          const d = n.data as unknown as GroupContainerData;
          const updatedMembers = d.members.map((m) => latestMap.get(m.id) ?? m);
          return { ...n, data: { ...n.data, members: updatedMembers } };
        });

      return [...others, ...newAppNodes];
    });
    setEdges((prev) => {
      const ideaEdges = prev.filter((e) => e.id.startsWith("idea-"));
      return [...buildEdges(appNodes.filter((n) => !nodes.some((rn) => rn.type === "group" && (rn.data as unknown as GroupContainerData).members.some((m) => m.id === n.id))), liveGap), ...ideaEdges];
    });
    const t = setTimeout(() => rfRef.current?.fitView({ padding: 0.28, duration: 400 }), 60);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeIdsKey, statusKey]);

  // ─── update idea nodes when competitor count changes ───────────────────
  useEffect(() => {
    setNodes((prev) =>
      prev.map((n) =>
        n.type === "idea"
          ? { ...n, data: { ...n.data, competitorCount: completedCount, latestCompetitorAt } }
          : n,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedCount, latestCompetitorAt]);

  // ─── gap refresh ──────────────────────────────────────────────────────────
  const handleRefreshGap = useCallback(async () => {
    if (gapRefreshing) return;
    setGapRefreshing(true);
    setNodes((prev) =>
      prev.map((n) =>
        n.id === "gap-node" ? { ...n, data: { ...n.data, refreshing: true } } : n,
      ),
    );

    const startedAt = new Date().toISOString();

    function applyNewGap(newGap: CanvasGapInfo) {
      setLiveGap(newGap);
      setNodes((prev) =>
        prev.map((n) =>
          n.id === "gap-node"
            ? {
                ...n,
                data: {
                  ...n.data,
                  gapTitle: newGap.title,
                  opportunity: newGap.opportunity,
                  refreshing: false,
                  onRefresh: () => gapRefreshRef.current(),
                },
              }
            : n,
        ),
      );
      setGapRefreshing(false);
    }

    // Fire-and-forget — don't rely on the SSE stream staying open for the result
    fetch(`/api/workspaces/${workspaceId}/findings/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ force: true }),
    }).catch(() => {});

    // Poll /status every 4 s until a synthesis newer than startedAt appears
    let applied = false;
    for (let i = 0; i < 25; i++) {
      await new Promise<void>((r) => setTimeout(r, 4000));
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/status`);
        if (!res.ok) continue;
        const data = await res.json() as {
          findings?: { generatedAt?: string; featureGaps?: Array<{ title: string; opportunity?: string }> } | null;
        };
        const f = data.findings;
        if (f?.featureGaps?.[0] && f.generatedAt && f.generatedAt > startedAt) {
          applyNewGap({ title: f.featureGaps[0].title, opportunity: f.featureGaps[0].opportunity ?? "" });
          applied = true;
          break;
        }
      } catch { /* network hiccup — keep polling */ }
    }

    if (!applied) {
      // Timed out — clear the spinner at least
      setGapRefreshing(false);
      setNodes((prev) =>
        prev.map((n) =>
          n.id === "gap-node" ? { ...n, data: { ...n.data, refreshing: false } } : n,
        ),
      );
    }
  }, [gapRefreshing, workspaceId]);

  gapRefreshRef.current = handleRefreshGap;

  // ─── re-apply dimming ─────────────────────────────────────────────────────
  useEffect(() => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.type === "group") return n;
        return {
          ...n,
          style: state.dimmedNodeIds.includes(n.id)
            ? { ...n.style, opacity: 0.3, transition: "opacity 0.2s" }
            : { ...n.style, opacity: 1, transition: "opacity 0.2s" },
        };
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.dimmedNodeIds]);

  // ─── position persistence ─────────────────────────────────────────────────
  const persistPosition = usePersistPosition(workspaceId);
  const notePositionTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const ideaPositionTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      changes.forEach((c) => {
        if (c.type === "position" && c.id && c.position) {
          if (c.id.startsWith("group-")) return; // container position saved on drag stop
          _savedPositions.set(c.id, c.position);
          if (c.id.startsWith("idea-")) {
            const ideaId = c.id.replace(/^idea-/, "");
            const ex = ideaPositionTimers.current.get(ideaId);
            if (ex) clearTimeout(ex);
            ideaPositionTimers.current.set(ideaId, setTimeout(() => {
              ideaPositionTimers.current.delete(ideaId);
              fetch(`/api/workspaces/${workspaceId}/idea/${ideaId}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ x: c.position!.x, y: c.position!.y }),
              }).catch(() => {});
            }, 600));
          } else if (c.id.startsWith("note-")) {
            const noteId = c.id.slice(5);
            const ex = notePositionTimers.current.get(noteId);
            if (ex) clearTimeout(ex);
            notePositionTimers.current.set(noteId, setTimeout(() => {
              notePositionTimers.current.delete(noteId);
              fetch(`/api/workspaces/${workspaceId}/notes/${noteId}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ x: c.position!.x, y: c.position!.y }),
              }).catch(() => {});
            }, 600));
          } else {
            persistPosition(c.id, c.position.x, c.position.y);
          }
        }
      });
      onNodesChange(changes);
    },
    [onNodesChange, persistPosition, workspaceId],
  );

  // ─── drag-over highlight (competitor + idea nodes) ───────────────────────
  function handleNodeDrag(_: MouseEvent | TouchEvent, node: Node) {
    if (node.type !== "competitor" && node.type !== "idea") return;

    const nodeCenter = {
      x: node.position.x + (node.type === "idea" ? 144 : 120),
      y: node.position.y + (node.type === "idea" ? 70 : 40),
    };
    let hitId: string | null = null;

    setNodes((prev) => {
      for (const n of prev) {
        if (n.type !== "group") continue;
        const d = n.data as unknown as GroupContainerData;
        if (d.collapsed) continue;
        const w = (n.style?.width as number) ?? CONTAINER_W;
        const h = (n.style?.height as number) ?? 150;
        if (
          nodeCenter.x >= n.position.x - CATCH_MARGIN &&
          nodeCenter.x <= n.position.x + w + CATCH_MARGIN &&
          nodeCenter.y >= n.position.y - CATCH_MARGIN &&
          nodeCenter.y <= n.position.y + h + CATCH_MARGIN
        ) {
          hitId = d.groupId;
          break;
        }
      }
      if (hitId === dragOverGroupRef.current) return prev; // no change
      const prev_ = dragOverGroupRef.current;
      dragOverGroupRef.current = hitId;
      return prev.map((n) => {
        if (n.type !== "group") return n;
        const d = n.data as unknown as GroupContainerData;
        if (d.groupId === hitId) return { ...n, data: { ...n.data, dragOver: true } };
        if (d.groupId === prev_) return { ...n, data: { ...n.data, dragOver: false } };
        return n;
      });
    });
  }

  // ─── drag-in: snap competitor into container on drop ─────────────────────
  function handleNodeDragStop(_: MouseEvent | TouchEvent, node: Node) {
    // Clear drag-over highlight
    if (dragOverGroupRef.current !== null) {
      const prev = dragOverGroupRef.current;
      dragOverGroupRef.current = null;
      setNodes((ns) =>
        ns.map((n) => {
          if (n.type !== "group") return n;
          if ((n.data as unknown as GroupContainerData).groupId !== prev) return n;
          return { ...n, data: { ...n.data, dragOver: false } };
        }),
      );
    }

    if (node.type === "group") {
      // Persist container position
      const d = node.data as unknown as GroupContainerData;
      fetch(`/api/workspaces/${workspaceId}/groups/${d.groupId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x: node.position.x, y: node.position.y }),
      }).catch(() => {});
      return;
    }

    if (node.type !== "competitor" && node.type !== "idea") return;

    const isIdea = node.type === "idea";
    const nodeCenter = {
      x: node.position.x + (isIdea ? 144 : 120),
      y: node.position.y + (isIdea ? 70 : 40),
    };

    setNodes((prev) => {
      const hitContainer = prev.find((n) => {
        if (n.type !== "group") return false;
        const d = n.data as unknown as GroupContainerData;
        if (d.collapsed) return false;
        const w = (n.style?.width as number) ?? CONTAINER_W;
        const h = (n.style?.height as number) ?? 300;
        const SNAP_MARGIN = 20;
        return (
          nodeCenter.x >= n.position.x - SNAP_MARGIN &&
          nodeCenter.x <= n.position.x + w + SNAP_MARGIN &&
          nodeCenter.y >= n.position.y - SNAP_MARGIN &&
          nodeCenter.y <= n.position.y + h + SNAP_MARGIN
        );
      });

      if (!hitContainer) return prev;

      const gd = hitContainer.data as unknown as GroupContainerData;
      if (gd.members.some((m) => m.id === (isIdea ? (node.data as any).ideaId : node.id))) return prev;

      let newMember: CanvasAppNode;
      let persistId: string; // the ID stored in group nodeIds

      if (isIdea) {
        const iData = node.data as unknown as import("./idea/IdeaNode").IdeaNodeData;
        newMember = ideaToMember({
          ideaId: iData.ideaId, text: iData.text, targetUser: iData.targetUser,
          keyFeature: iData.keyFeature, verdict: iData.verdict, evaluation: iData.evaluation,
          lastEvaluatedAt: iData.lastEvaluatedAt, x: node.position.x, y: node.position.y,
        });
        persistId = `idea:${iData.ideaId}`;
        // Remove idea edges
        setEdges((e) => e.filter((edge) => !edge.id.startsWith(`idea-${iData.ideaId}-`)));
      } else {
        const nodeAppData = appNodes.find((n) => n.id === node.id);
        if (!nodeAppData) return prev;
        newMember = nodeAppData;
        persistId = node.id;
        // Persist competitor groupId
        fetch(`/api/workspaces/${workspaceId}/nodes/${node.id}/group`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ groupId: gd.groupId }),
        }).catch(() => {});
      }

      const newMembers = [...gd.members, newMember];
      const rawNodeIds = newMembers.map((m) =>
        m.memberType === "idea" ? `idea:${m.id}` : m.id,
      );
      fetch(`/api/workspaces/${workspaceId}/groups/${gd.groupId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeIds: rawNodeIds }),
      }).catch(() => {});

      return prev
        .filter((n) => n.id !== node.id)
        .map((n) => {
          if (n.id !== hitContainer.id) return n;
          return { ...n, data: { ...n.data, members: newMembers } };
        });
    });
  }

  // ─── group CRUD handlers ──────────────────────────────────────────────────
  function handleGroupLabelChange(groupId: string, label: string) {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === `group-${groupId}` ? { ...n, data: { ...n.data, label } } : n,
      ),
    );
    fetch(`/api/workspaces/${workspaceId}/groups/${groupId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    }).catch(() => {});
  }

  function handleGroupColorChange(groupId: string, color: ContainerColor) {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === `group-${groupId}` ? { ...n, data: { ...n.data, color } } : n,
      ),
    );
    fetch(`/api/workspaces/${workspaceId}/groups/${groupId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ color }),
    }).catch(() => {});
  }

  function handleGroupCollapse(groupId: string) {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== `group-${groupId}`) return n;
        const d = n.data as unknown as GroupContainerData;
        const newCollapsed = !d.collapsed;
        const currentW = (n.style?.width as number) ?? 420;
        const currentH = (n.style?.height as number) ?? 300;
        const newH = newCollapsed
          ? 56
          : Math.max(currentH, computeContainerHeight(d.members.length, false), 300);
        fetch(`/api/workspaces/${workspaceId}/groups/${groupId}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collapsed: newCollapsed }),
        }).catch(() => {});
        return {
          ...n,
          style: { ...n.style, width: currentW, height: newH, zIndex: 10 },
          data: { ...n.data, collapsed: newCollapsed },
        };
      }),
    );
  }

  function dissolveGroup(groupId: string, groupNode: Node) {
    const d = groupNode.data as unknown as GroupContainerData;
    const baseX = groupNode.position.x;
    const baseY = groupNode.position.y + (groupNode.style?.height as number ?? 300) + 24;

    const ejectedNodes: Node[] = d.members.map((member, i) => {
      const pos = { x: baseX + (i % 2) * 280, y: baseY + Math.floor(i / 2) * 130 };

      if (member.memberType === "idea") {
        _savedPositions.set(`idea-${member.id}`, pos);
        const ev = member.ideaEvaluation as IdeaEvaluation | null;
        // restore edges after setNodes settles
        if (ev) {
          setTimeout(() =>
            setEdges((e) => [...e, ...buildIdeaEdgesFromEvaluation(member.id, ev)]), 0);
        }
        return buildIdeaRFNode({
          ideaId: member.id,
          text: member.ideaText ?? "",
          targetUser: member.ideaTargetUser ?? null,
          keyFeature: member.ideaKeyFeature ?? null,
          verdict: member.ideaVerdict ?? null,
          evaluation: ev,
          lastEvaluatedAt: member.ideaLastEvaluatedAt ?? null,
          x: pos.x, y: pos.y,
        }, false);
      }

      _savedPositions.set(member.id, pos);
      fetch(`/api/workspaces/${workspaceId}/nodes/${member.id}/group`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: null }),
      }).catch(() => {});
      return { id: member.id, type: "competitor" as const, position: pos, data: { ...member }, draggable: true };
    });

    return ejectedNodes;
  }

  function handleGroupUngroup(groupId: string) {
    setNodes((prev) => {
      const groupNode = prev.find((n) => n.id === `group-${groupId}`);
      if (!groupNode) return prev;
      const ejectedNodes = dissolveGroup(groupId, groupNode);
      fetch(`/api/workspaces/${workspaceId}/groups/${groupId}`, { method: "DELETE" }).catch(() => {});
      return [...prev.filter((n) => n.id !== `group-${groupId}`), ...ejectedNodes];
    });
  }

  function handleGroupDelete(groupId: string) {
    setNodes((prev) => {
      const groupNode = prev.find((n) => n.id === `group-${groupId}`);
      if (!groupNode) return prev;
      const ejectedNodes = dissolveGroup(groupId, groupNode);
      fetch(`/api/workspaces/${workspaceId}/groups/${groupId}`, { method: "DELETE" }).catch(() => {});
      return [...prev.filter((n) => n.id !== `group-${groupId}`), ...ejectedNodes];
    });
  }

  function handleNodeEject(groupId: string, nodeId: string, screenPos: { x: number; y: number }) {
    const flowPos = rfRef.current?.screenToFlowPosition(screenPos) ?? { x: screenPos.x, y: screenPos.y };

    setNodes((prev) => {
      const groupNode = prev.find((n) => n.id === `group-${groupId}`);
      if (!groupNode) return prev;
      const gd = groupNode.data as unknown as GroupContainerData;

      const ejectedMember = gd.members.find((m) => m.id === nodeId);
      if (!ejectedMember) return prev;

      const newMembers = gd.members.filter((m) => m.id !== nodeId);
      const rawNodeIds = newMembers.map((m) =>
        m.memberType === "idea" ? `idea:${m.id}` : m.id,
      );

      fetch(`/api/workspaces/${workspaceId}/groups/${groupId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeIds: rawNodeIds }),
      }).catch(() => {});

      let freeNode: Node;

      if (ejectedMember.memberType === "idea") {
        const pos = { x: flowPos.x - 144, y: flowPos.y - 70 };
        _savedPositions.set(`idea-${nodeId}`, pos);
        freeNode = buildIdeaRFNode({
          ideaId: nodeId,
          text: ejectedMember.ideaText ?? "",
          targetUser: ejectedMember.ideaTargetUser ?? null,
          keyFeature: ejectedMember.ideaKeyFeature ?? null,
          verdict: ejectedMember.ideaVerdict ?? null,
          evaluation: ejectedMember.ideaEvaluation as IdeaEvaluation | null ?? null,
          lastEvaluatedAt: ejectedMember.ideaLastEvaluatedAt ?? null,
          x: pos.x, y: pos.y,
        }, false);
        // Restore idea edges
        const ev = ejectedMember.ideaEvaluation as IdeaEvaluation | null;
        if (ev) {
          setEdges((e) => [...e, ...buildIdeaEdgesFromEvaluation(nodeId, ev)]);
        }
      } else {
        const pos = { x: flowPos.x - 120, y: flowPos.y - 40 };
        _savedPositions.set(nodeId, pos);
        freeNode = {
          id: nodeId, type: "competitor", position: pos,
          data: { ...ejectedMember }, draggable: true,
        };
        fetch(`/api/workspaces/${workspaceId}/nodes/${nodeId}/group`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ groupId: null }),
        }).catch(() => {});
      }

      return [
        ...prev
          .filter((n) => n.id !== nodeId && n.id !== `idea-${nodeId}`)
          .map((n) => {
            if (n.id !== `group-${groupId}`) return n;
            return { ...n, data: { ...n.data, members: newMembers } };
          }),
        freeNode,
      ];
    });
  }

  function handleMemberClick(memberId: string) {
    // Check if this member is an idea (it's in a group as idea:${id})
    const isGroupedIdea = nodes.some(
      (n) =>
        n.type === "group" &&
        (n.data as unknown as GroupContainerData).members.some(
          (m) => m.id === memberId && m.memberType === "idea",
        ),
    );
    if (isGroupedIdea) {
      deselectAll();
      setBreakdownIdeaId(memberId);
    } else {
      selectNode(memberId);
      setBreakdownIdeaId(null);
    }
  }

  // Keep handlers current
  groupHandlersRef.current.onLabelChange = handleGroupLabelChange;
  groupHandlersRef.current.onColorChange = handleGroupColorChange;
  groupHandlersRef.current.onCollapse = handleGroupCollapse;
  groupHandlersRef.current.onUngroup = handleGroupUngroup;
  groupHandlersRef.current.onDelete = handleGroupDelete;
  groupHandlersRef.current.onNodeEject = handleNodeEject;
  groupHandlersRef.current.onMemberClick = handleMemberClick;

  // ─── idea handlers ────────────────────────────────────────────────────────
  function handleIdeaEvaluated(ideaId: string, evaluation: IdeaEvaluation) {
    const rfId = `idea-${ideaId}`;
    setNodes((prev) =>
      prev.map((n) =>
        n.id === rfId
          ? { ...n, data: { ...n.data, verdict: evaluation.verdict, evaluation, lastEvaluatedAt: new Date().toISOString() } }
          : n,
      ),
    );
    setEdges((prev) => [
      ...prev.filter((e) => !e.id.startsWith(`${rfId}-`)),
      ...buildIdeaEdgesFromEvaluation(ideaId, evaluation),
    ]);
  }

  async function handleIdeaSave(ideaId: string, fields: { text?: string; targetUser?: string; keyFeature?: string }) {
    const rfId = `idea-${ideaId}`;
    setNodes((prev) => prev.map((n) => n.id === rfId ? { ...n, data: { ...n.data, ...fields } } : n));
    await fetch(`/api/workspaces/${workspaceId}/idea/${ideaId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
  }

  function handleDeleteIdea(ideaId: string) {
    const rfId = `idea-${ideaId}`;
    setNodes((prev) => prev.filter((n) => n.id !== rfId));
    setEdges((prev) => prev.filter((e) => !e.id.startsWith(`${rfId}-`)));
    setBreakdownIdeaId((prev) => (prev === ideaId ? null : prev));
    _savedPositions.delete(rfId);
    fetch(`/api/workspaces/${workspaceId}/idea/${ideaId}`, { method: "DELETE" }).catch(() => {});
  }

  ideaHandlersRef.current.onEvaluated = handleIdeaEvaluated;
  ideaHandlersRef.current.onSave = handleIdeaSave;
  ideaHandlersRef.current.onDelete = handleDeleteIdea;

  async function handleAddIdea() {
    if (!isProUser) { setIdeaPaywallOpen(true); return; }
    if (!rfRef.current) return;
    const { x, y, zoom } = rfRef.current.getViewport();
    const cx = (-x + window.innerWidth / 2) / zoom;
    const cy = (-y + window.innerHeight / 2) / zoom;
    const pos = { x: cx - 144, y: cy - 100 };
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/idea`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "", targetUser: null, keyFeature: null, ...pos }),
      });
      if (!res.ok) return;
      const idea = (await res.json()) as { id: string };
      const rfId = `idea-${idea.id}`;
      _savedPositions.set(rfId, pos);
      setNodes((prev) => [
        ...prev,
        buildIdeaRFNode({ ideaId: idea.id, text: "", targetUser: null, keyFeature: null, verdict: null, evaluation: null, lastEvaluatedAt: null, x: pos.x, y: pos.y }, true),
      ]);
      setTimeout(() => rfRef.current?.fitView({ nodes: [{ id: rfId }], duration: 400, padding: 0.45 }), 60);
    } catch {}
  }

  async function handlePaneClick(e: React.MouseEvent) {
    deselectAll();
    if (!rfRef.current) return;

    if (state.activeTool === "note") {
      const position = rfRef.current.screenToFlowPosition({ x: e.clientX, y: e.clientY });
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/notes`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: "", x: position.x, y: position.y }),
        });
        if (!res.ok) return;
        const note = (await res.json()) as { id: string };
        setNodes((prev) => [
          ...prev,
          { id: `note-${note.id}`, type: "note", position, data: { noteId: note.id, text: "", pinnedToNodeId: null, animateIn: true }, draggable: true },
        ]);
      } catch {}
      return;
    }

    if (state.activeTool === "group") {
      const position = rfRef.current.screenToFlowPosition({ x: e.clientX, y: e.clientY });
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/groups`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label: "New group", color: "zinc", nodeIds: [], x: position.x - 140, y: position.y - 30 }),
        });
        if (!res.ok) return;
        const group = (await res.json()) as { id: string };
        setNodes((prev) => [
          makeGroupNode(group.id, "New group", "zinc", [], position.x - 140, position.y - 30, false),
          ...prev,
        ]);
      } catch {}
      setTool("select");
    }
  }

  // ─── derived state ────────────────────────────────────────────────────────
  const panelNodeId = state.activeTool !== "compare" ? (state.selectedNodeIds[0] ?? null) : null;
  const selectedNode = panelNodeId ? appNodes.find((n) => n.id === panelNodeId) ?? null : null;
  const compareNodes = state.selectedNodeIds
    .map((id) => appNodes.find((n) => n.id === id))
    .filter((n): n is CanvasAppNode => n != null);

  const ideaRFNode = breakdownIdeaId ? nodes.find((n) => n.id === `idea-${breakdownIdeaId}`) : null;
  // Also check if the idea is currently grouped (no RF node exists)
  const groupedIdeaMember = breakdownIdeaId && !ideaRFNode
    ? nodes
        .filter((n) => n.type === "group")
        .flatMap((n) => (n.data as unknown as GroupContainerData).members)
        .find((m) => m.id === breakdownIdeaId && m.memberType === "idea") ?? null
    : null;
  const ideaNodeData: IdeaNodeData | null = ideaRFNode
    ? (ideaRFNode.data as unknown as IdeaNodeData)
    : groupedIdeaMember
      ? {
          workspaceId,
          ideaId: groupedIdeaMember.id,
          text: groupedIdeaMember.ideaText ?? "",
          targetUser: groupedIdeaMember.ideaTargetUser ?? null,
          keyFeature: groupedIdeaMember.ideaKeyFeature ?? null,
          verdict: groupedIdeaMember.ideaVerdict ?? null,
          evaluation: (groupedIdeaMember.ideaEvaluation as IdeaEvaluation | null) ?? null,
          lastEvaluatedAt: groupedIdeaMember.ideaLastEvaluatedAt ?? null,
          competitorCount: completedCount,
          latestCompetitorAt,
          onEvaluated: (ev) => ideaHandlersRef.current.onEvaluated(groupedIdeaMember.id, ev),
          onSave: (f) => ideaHandlersRef.current.onSave(groupedIdeaMember.id, f),
          onOpenBreakdown: () => {},
          onDelete: () => ideaHandlersRef.current.onDelete(groupedIdeaMember.id),
        }
      : null;

  const competitors = appNodes.filter((n) => n.nodeStatus === "complete").map((n) => ({ id: n.id, name: n.name }));

  function handleDeleteNote(rfNodeId: string) {
    setNodes((prev) => prev.filter((n) => n.id !== rfNodeId));
  }

  return (
    <CanvasNoteContext.Provider value={{ workspaceId, competitors, onDeleteNote: handleDeleteNote }}>
      <div className="flex h-[calc(100vh-56px)] flex-col overflow-hidden bg-zinc-950">
        <CanvasTopBar
          workspaceId={workspaceId}
          workspaceName={workspaceName}
          onAddApp={() => setAddModalOpen(true)}
        />

        <div className="relative flex flex-1 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3">
            <div className="pointer-events-auto">
              <CanvasToolbar
                onAddRequest={() => setAddModalOpen(true)}
                onAddIdea={handleAddIdea}
                appNodes={appNodes}
              />
            </div>
          </div>

          <div className="h-full w-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              panOnDrag={isPanMode}
              panOnScroll={!isPanMode}
              zoomOnScroll={!isPanMode}
              selectionOnDrag={false}
              onNodeDrag={handleNodeDrag}
              onNodeDragStop={handleNodeDragStop}
              onNodeClick={(_, node) => {
                if (node.type === "competitor") {
                  selectNode(node.id);
                  setBreakdownIdeaId(null);
                } else if (node.type === "idea") {
                  deselectAll();
                  const iData = node.data as unknown as IdeaNodeData;
                  if (iData.verdict) setBreakdownIdeaId(iData.ideaId);
                } else if (node.type === "addApp") {
                  setAddModalOpen(true);
                }
              }}
              onPaneClick={(e) => handlePaneClick(e)}
              onInit={(instance) => {
                rfRef.current = instance;
                setTimeout(() => instance.fitView({ padding: 0.28, duration: 350 }), 80);
              }}
              proOptions={{ hideAttribution: true }}
              minZoom={0.15}
              maxZoom={2.5}
              deleteKeyCode={null}
              selectionKeyCode={null}
              nodesConnectable={false}
              colorMode="dark"
              style={{
                background: "transparent",
                cursor: isPanMode ? "grab"
                  : state.activeTool === "note" ? "crosshair"
                  : state.activeTool === "group" ? "crosshair"
                  : undefined,
              }}
            >
              <Background variant={BackgroundVariant.Dots} color="#27272a" gap={28} size={1.5} />
              <MiniMap
                position="bottom-left"
                nodeColor={(n) => {
                  if (n.type === "gap") return "#2dd4bf";
                  if (n.type === "competitor") return "#3f3f46";
                  if (n.type === "group") return "#27272a";
                  return "#27272a";
                }}
                style={{
                  background: "#18181b", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "10px", marginLeft: "4px", marginBottom: "8px",
                }}
                maskColor="rgba(0,0,0,0.55)"
              />
              <Panel position="bottom-right"><ZoomControls /></Panel>
            </ReactFlow>
          </div>

          <AnimatePresence>
            {selectedNode && (
              <NodeDetailPanel
                key={selectedNode.id}
                appNode={selectedNode}
                workspaceId={workspaceId}
                onClose={() => deselectAll()}
                onRemove={() => deselectAll()}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {breakdownIdeaId !== null && ideaNodeData?.verdict && ideaNodeData?.evaluation && (
              <IdeaBreakdownPanel
                key={`idea-breakdown-${breakdownIdeaId}`}
                text={ideaNodeData.text}
                targetUser={ideaNodeData.targetUser ?? null}
                keyFeature={ideaNodeData.keyFeature ?? null}
                verdict={ideaNodeData.verdict}
                evaluation={ideaNodeData.evaluation}
                onClose={() => setBreakdownIdeaId(null)}
                onDelete={() => handleDeleteIdea(breakdownIdeaId)}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {state.activeTool === "compare" && compareNodes.length > 0 && (
              <ComparePanel nodes={compareNodes} onClose={() => setTool("select")} />
            )}
          </AnimatePresence>
        </div>

        <AddNodeModal
          workspaceId={workspaceId}
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onNodeAdded={() => { setAddModalOpen(false); router.refresh(); }}
          existingCategories={[...new Set(appNodes.map((n) => n.category).filter((c): c is string => !!c))]}
        />

        <PaywallModal
          open={ideaPaywallOpen}
          onClose={() => setIdeaPaywallOpen(false)}
          gate="idea_evaluation"
        />
      </div>
    </CanvasNoteContext.Provider>
  );
}
