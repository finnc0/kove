"use client";

import { useEffect, useRef } from "react";
import { type CanvasTool, useCanvasStore } from "../_store/canvasStore";
import type { ReactFlowInstance } from "@xyflow/react";

const KEY_TO_TOOL: Record<string, CanvasTool> = {
  v: "select",
  h: "pan",
  a: "add",
  n: "note",
  g: "group",
  f: "filter",
  c: "compare",
};

interface Options {
  rfInstance: ReactFlowInstance | null;
}

/**
 * Wires keyboard shortcuts to the canvas store.
 * Space-hold → pan while held, restore previous tool on release.
 * Esc → select + deselect.
 * Cmd/Ctrl+0 → fit view.
 */
export function useCanvasShortcuts({ rfInstance }: Options) {
  const { state, setTool, deselectAll } = useCanvasStore();
  const prevToolRef = useRef<CanvasTool>("select");
  const spaceHeld = useRef(false);

  // Keep prevToolRef current (but don't track pan — pan is transient)
  useEffect(() => {
    if (state.activeTool !== "pan") {
      prevToolRef.current = state.activeTool;
    }
  }, [state.activeTool]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      // Cmd/Ctrl+0 → fit view
      if ((e.metaKey || e.ctrlKey) && e.key === "0") {
        e.preventDefault();
        rfInstance?.fitView({ padding: 0.28, duration: 400 });
        return;
      }

      // Escape → select + deselect
      if (e.key === "Escape") {
        setTool("select");
        deselectAll();
        return;
      }

      // Space-hold → temporarily pan
      if (e.key === " " && !spaceHeld.current) {
        e.preventDefault();
        spaceHeld.current = true;
        setTool("pan");
        return;
      }

      // Single-letter tool shortcuts (no modifier)
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        const tool = KEY_TO_TOOL[e.key.toLowerCase()];
        if (tool) setTool(tool);
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.key === " " && spaceHeld.current) {
        spaceHeld.current = false;
        setTool(prevToolRef.current);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [rfInstance, setTool, deselectAll]);
}
