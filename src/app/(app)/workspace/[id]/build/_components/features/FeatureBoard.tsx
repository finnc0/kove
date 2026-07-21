"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Plus, Sparkles } from "lucide-react";
import { KanbanColumn } from "./KanbanColumn";
import { AddFeatureModal } from "./AddFeatureModal";
import { AiSuggestFeatures } from "./AiSuggestFeatures";
import { CategoryFilter } from "./CategoryFilter";
import { MarketSignalsGuard } from "../shared/MarketSignalsGuard";

const EASE = [0.22, 1, 0.36, 1] as const;

export const COLUMNS = [
  { id: "ideas",       label: "Ideas" },
  { id: "not-started", label: "Not Started" },
  { id: "in-progress", label: "In Progress" },
  { id: "done",        label: "Done" },
] as const;

export type ColumnId = typeof COLUMNS[number]["id"];

export interface Feature {
  id: string;
  title: string;
  description: string | null;
  category: string;
  priority: number;
  columnId: string;
  sourceGap: string | null;
  status: string;
  buildPrompt: string | null;
}

interface Plan {
  id: string;
  name: string;
  idea: string | null;
  targetUser: string | null;
  features: Feature[];
}

interface Props {
  workspaceId: string;
  workspaceName: string;
  plan: Plan;
  competitorCount: number;
}

export function FeatureBoard({ workspaceId, workspaceName, plan, competitorCount }: Props) {
  const reduced = useReducedMotion();
  const [features, setFeatures] = useState<Feature[]>(plan.features);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showMvpOnly, setShowMvpOnly] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);

  const visibleFeatures = features.filter((f) => {
    if (showMvpOnly && f.category !== "core") return false;
    if (categoryFilter && f.category !== categoryFilter) return false;
    return true;
  });

  const patchFeature = useCallback(async (featureId: string, patch: Partial<Feature>) => {
    setFeatures((prev) => prev.map((f) => (f.id === featureId ? { ...f, ...patch } : f)));
    await fetch(`/api/workspaces/${workspaceId}/build/features/${featureId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  }, [workspaceId]);

  const deleteFeature = useCallback(async (featureId: string) => {
    setFeatures((prev) => prev.filter((f) => f.id !== featureId));
    await fetch(`/api/workspaces/${workspaceId}/build/features/${featureId}`, { method: "DELETE" });
  }, [workspaceId]);

  const addFeatures = useCallback((newFeatures: Feature[]) => {
    setFeatures((prev) => [...prev, ...newFeatures]);
  }, []);

  const moveToColumn = useCallback(async (featureId: string, columnId: ColumnId) => {
    await patchFeature(featureId, { columnId });
  }, [patchFeature]);

  return (
    <div className="min-h-screen bg-zinc-950" style={{
      backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1.5px, transparent 1.5px)",
      backgroundSize: "32px 32px",
    }}>
      {/* Top bar */}
      <div className="sticky top-0 z-20 border-b border-white/[0.06] bg-zinc-950/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/workspace/${workspaceId}/build`}
              className="flex items-center gap-1.5 text-xs text-zinc-600 transition-colors hover:text-zinc-400 shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Build Zone
            </Link>
            <span className="text-zinc-700">/</span>
            <span className="text-sm font-semibold text-white truncate">Feature Organizer</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <CategoryFilter
              value={categoryFilter}
              onChange={setCategoryFilter}
              mvpOnly={showMvpOnly}
              onMvpToggle={() => setShowMvpOnly((v) => !v)}
            />
            <button
              onClick={() => setSuggestOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-white/[0.16] hover:text-white"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#2dd4bf]" />
              Suggest features
            </button>
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-[#2dd4bf] px-3 py-1.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-[#5eead4]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add feature
            </button>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="mx-auto max-w-7xl px-6 py-6 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              features={visibleFeatures.filter((f) => f.columnId === col.id)}
              workspaceId={workspaceId}
              onPatch={patchFeature}
              onDelete={deleteFeature}
              onMove={moveToColumn}
            />
          ))}
        </div>
      </div>

      {/* Suggest AI features guard */}
      {suggestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={reduced ? {} : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="w-full max-w-lg"
          >
            <MarketSignalsGuard workspaceId={workspaceId} competitorCount={competitorCount}>
              <AiSuggestFeatures
                workspaceId={workspaceId}
                buildPlanId={plan.id}
                onAdd={addFeatures}
                onClose={() => setSuggestOpen(false)}
              />
            </MarketSignalsGuard>
            {competitorCount < 3 && (
              <button
                onClick={() => setSuggestOpen(false)}
                className="mt-3 w-full text-center text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                Close
              </button>
            )}
          </motion.div>
        </div>
      )}

      {/* Add feature modal */}
      {addOpen && (
        <AddFeatureModal
          workspaceId={workspaceId}
          buildPlanId={plan.id}
          onAdd={(f) => addFeatures([f])}
          onClose={() => setAddOpen(false)}
        />
      )}
    </div>
  );
}
