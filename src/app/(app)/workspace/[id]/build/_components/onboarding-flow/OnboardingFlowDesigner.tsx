"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, Plus, LayoutList, Columns } from "lucide-react";
import type { OFScreen, OFTier } from "./types";
import { OFScreenCard } from "./OFScreenCard";
import { OFDetailPanel } from "./OFDetailPanel";
import { OFAddScreenModal } from "./OFAddScreenModal";

const EASE = [0.22, 1, 0.36, 1] as const;

interface Props {
  workspaceId: string;
  workspaceName: string;
  initialScreens: OFScreen[];
  tiers: OFTier[];
}

export function OnboardingFlowDesigner({ workspaceId, workspaceName, initialScreens, tiers }: Props) {
  const reduced = useReducedMotion();
  const [screens, setScreens] = useState<OFScreen[]>(initialScreens);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const dragItem = useRef<string | null>(null);
  const dragOver = useRef<string | null>(null);

  const selected = screens.find((s) => s.id === selectedId) ?? null;

  const patchScreen = useCallback(async (id: string, patch: Partial<OFScreen>) => {
    setScreens((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    await fetch(`/api/workspaces/${workspaceId}/build/screens/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  }, [workspaceId]);

  const deleteScreen = useCallback(async (id: string) => {
    setScreens((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      return filtered.map((s, i) => ({ ...s, order: i }));
    });
    if (selectedId === id) setSelectedId(null);
    await fetch(`/api/workspaces/${workspaceId}/build/screens/${id}`, { method: "DELETE" });
  }, [workspaceId, selectedId]);

  const addScreen = useCallback((screen: OFScreen) => {
    setScreens((prev) => [...prev, screen]);
    setSelectedId(screen.id);
  }, []);

  // Drag-and-drop reorder
  const handleDragStart = (id: string) => {
    dragItem.current = id;
  };

  const handleDragEnter = (id: string) => {
    dragOver.current = id;
  };

  const handleDragEnd = async () => {
    if (!dragItem.current || !dragOver.current || dragItem.current === dragOver.current) {
      dragItem.current = null;
      dragOver.current = null;
      return;
    }
    const fromIndex = screens.findIndex((s) => s.id === dragItem.current);
    const toIndex = screens.findIndex((s) => s.id === dragOver.current);
    if (fromIndex === -1 || toIndex === -1) return;

    const reordered = [...screens];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    const withOrder = reordered.map((s, i) => ({ ...s, order: i }));

    setScreens(withOrder);
    dragItem.current = null;
    dragOver.current = null;

    // Persist new order for each changed screen
    await Promise.all(
      withOrder
        .filter((s, i) => initialScreens[i]?.id !== s.id || s.order !== screens[screens.findIndex((x) => x.id === s.id)]?.order)
        .map((s) =>
          fetch(`/api/workspaces/${workspaceId}/build/screens/${s.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: s.order }),
          }),
        ),
    );
  };

  return (
    <div className="flex h-screen flex-col bg-zinc-950" style={{
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
            <span className="text-sm font-semibold text-white truncate">Onboarding Flow</span>
            <span className="rounded-full border border-white/[0.06] bg-zinc-800/60 px-2 py-0.5 text-[10px] text-zinc-500">
              {screens.length} screen{screens.length !== 1 ? "s" : ""}
            </span>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#2dd4bf] px-3 py-1.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-[#5eead4] shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            Add screen
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Screen list */}
        <div className={[
          "flex flex-col overflow-y-auto border-r border-white/[0.06] transition-all",
          selected ? "w-80 shrink-0" : "w-full max-w-2xl mx-auto",
        ].join(" ")}>
          <div className="flex-1 overflow-y-auto p-4">
            {screens.length === 0 ? (
              <motion.div
                initial={reduced ? {} : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center gap-3 py-16 text-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-zinc-800/60">
                  <LayoutList className="h-5 w-5 text-zinc-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-400">No screens yet</p>
                  <p className="mt-0.5 text-xs text-zinc-600">Add your first screen to start mapping the flow</p>
                </div>
                <button
                  onClick={() => setAddOpen(true)}
                  className="mt-1 flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add screen
                </button>
              </motion.div>
            ) : (
              <div className="flex flex-col gap-2">
                <AnimatePresence>
                  {screens.map((screen) => (
                    <motion.div
                      key={screen.id}
                      layout
                      initial={reduced ? {} : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: EASE }}
                      onDragOver={(e) => { e.preventDefault(); handleDragEnter(screen.id); }}
                    >
                      <OFScreenCard
                        screen={screen}
                        tiers={tiers}
                        isSelected={selectedId === screen.id}
                        onSelect={() => setSelectedId(selectedId === screen.id ? null : screen.id)}
                        onDelete={() => void deleteScreen(screen.id)}
                        dragHandleProps={{
                          draggable: true,
                          onDragStart: () => handleDragStart(screen.id),
                        }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {/* Drop zone sentinel */}
                <div
                  className="h-2"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => void handleDragEnd()}
                />
              </div>
            )}
          </div>

          {/* Visual flow hint when no detail panel */}
          {!selected && screens.length > 0 && (
            <div className="border-t border-white/[0.04] px-4 py-3">
              <p className="flex items-center gap-1.5 text-[10px] text-zinc-700">
                <Columns className="h-3 w-3" />
                Click any screen to edit details and generate a build prompt
              </p>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selected && (
            <motion.div
              key={selected.id}
              initial={reduced ? {} : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="flex-1 overflow-hidden border-l border-white/[0.06]"
              onDragEnd={() => void handleDragEnd()}
            >
              <OFDetailPanel
                screen={selected}
                tiers={tiers}
                workspaceId={workspaceId}
                onPatch={patchScreen}
                onClose={() => setSelectedId(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {addOpen && (
        <OFAddScreenModal
          workspaceId={workspaceId}
          onAdd={addScreen}
          onClose={() => setAddOpen(false)}
        />
      )}
    </div>
  );
}
