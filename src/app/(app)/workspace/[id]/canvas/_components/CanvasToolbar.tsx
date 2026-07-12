"use client";

import { useRef, useState } from "react";
import {
  MousePointer2,
  Hand,
  Plus,
  StickyNote,
  Layers,
  Filter,
  Columns2,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { ToolButton } from "./ToolButton";
import { AddPopover } from "./tools/AddPopover";
import { FilterPanel } from "./tools/FilterPanel";
import { useCanvasStore, type CanvasTool } from "../_store/canvasStore";
import type { CanvasAppNode } from "./types";

interface Props {
  onAddRequest: () => void;
  onAddIdea: () => void;
  appNodes: CanvasAppNode[];
}

interface ToolDef {
  tool: CanvasTool;
  icon: React.ReactNode;
  label: string;
  shortcut: string;
}

const ICON_SIZE = "h-[18px] w-[18px]";

const NAV_TOOLS: ToolDef[] = [
  { tool: "select", icon: <MousePointer2 className={ICON_SIZE} />, label: "Select", shortcut: "V" },
  { tool: "pan",    icon: <Hand className={ICON_SIZE} />,          label: "Pan",    shortcut: "H" },
];

const CREATE_TOOLS: ToolDef[] = [
  { tool: "add",  icon: <Plus className={ICON_SIZE} />,       label: "Add",  shortcut: "A" },
  { tool: "note", icon: <StickyNote className={ICON_SIZE} />, label: "Note", shortcut: "N" },
];

const ORGANIZE_TOOLS: ToolDef[] = [
  { tool: "group",  icon: <Layers className={ICON_SIZE} />,  label: "Group",  shortcut: "G" },
  { tool: "filter", icon: <Filter className={ICON_SIZE} />,  label: "Filter", shortcut: "F" },
];

const ANALYZE_TOOLS: ToolDef[] = [
  { tool: "compare", icon: <Columns2 className={ICON_SIZE} />, label: "Compare", shortcut: "C" },
];

function Divider() {
  return <div className="mx-2 h-px bg-white/[0.06]" />;
}

export function CanvasToolbar({ onAddRequest, onAddIdea, appNodes }: Props) {
  const { state, setTool, clearFilters } = useCanvasStore();
  const [addPopoverOpen, setAddPopoverOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const addBtnRef = useRef<HTMLDivElement>(null);

  const hasActiveFilter = state.filters.length > 0;

  function handleTool(tool: CanvasTool) {
    if (tool === "add") {
      setTool(tool);
      setAddPopoverOpen((v) => !v);
      setFilterOpen(false);
      return;
    }
    if (tool === "filter") {
      setTool(tool);
      setFilterOpen((v) => !v);
      setAddPopoverOpen(false);
      return;
    }
    setAddPopoverOpen(false);
    setFilterOpen(false);
    setTool(tool);
  }

  function renderGroup(tools: ToolDef[]) {
    return tools.map(({ tool, icon, label, shortcut }) => {
      if (tool === "add") {
        return (
          <div key="add" ref={addBtnRef} className="relative">
            <ToolButton
              icon={icon}
              label={label}
              shortcut={shortcut}
              active={state.activeTool === tool}
              onClick={() => handleTool(tool)}
            />
            <AnimatePresence>
              {addPopoverOpen && (
                <AddPopover
                  onAddCompetitor={() => {
                    setAddPopoverOpen(false);
                    onAddRequest();
                  }}
                  onAddIdea={() => {
                    setAddPopoverOpen(false);
                    setTool("select");
                    onAddIdea();
                  }}
                  onClose={() => {
                    setAddPopoverOpen(false);
                    setTool("select");
                  }}
                />
              )}
            </AnimatePresence>
          </div>
        );
      }

      if (tool === "filter") {
        return (
          <div key="filter" className="relative">
            {hasActiveFilter && !filterOpen && (
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#2dd4bf]" />
            )}
            <ToolButton
              icon={icon}
              label={label}
              shortcut={shortcut}
              active={state.activeTool === tool || hasActiveFilter}
              onClick={() => handleTool(tool)}
            />
            <AnimatePresence>
              {filterOpen && (
                <FilterPanel
                  appNodes={appNodes}
                  onClose={() => {
                    setFilterOpen(false);
                    if (state.filters.length === 0) setTool("select");
                  }}
                />
              )}
            </AnimatePresence>
          </div>
        );
      }

      if (tool === "group") {
        const isActive = state.activeTool === "group";
        return (
          <div key="group" className="relative">
            <ToolButton
              icon={icon}
              label={isActive ? "Click canvas to place" : label}
              shortcut={shortcut}
              active={isActive}
              onClick={() => handleTool(tool === state.activeTool ? "select" : tool)}
            />
          </div>
        );
      }

      return (
        <ToolButton
          key={tool}
          icon={icon}
          label={label}
          shortcut={shortcut}
          active={state.activeTool === tool}
          onClick={() => handleTool(tool)}
        />
      );
    });
  }

  return (
    <div className="flex flex-col gap-0.5 rounded-2xl border border-white/[0.06] bg-zinc-900/90 p-1.5 shadow-xl backdrop-blur-md">
      {renderGroup(NAV_TOOLS)}
      <Divider />
      {renderGroup(CREATE_TOOLS)}
      <Divider />
      {renderGroup(ORGANIZE_TOOLS)}
      <Divider />
      {renderGroup(ANALYZE_TOOLS)}
    </div>
  );
}
