"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { type NodeProps, NodeResizer } from "@xyflow/react";
import { X, Pin } from "lucide-react";
import { motion } from "framer-motion";
import { CanvasNoteContext } from "../CanvasNoteContext";

export interface StickyNoteData extends Record<string, unknown> {
  text: string;
  noteId: string;
  pinnedToNodeId?: string | null;
  animateIn?: boolean;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export function StickyNote({ id, data, selected }: NodeProps) {
  const noteData = data as unknown as StickyNoteData;
  const { workspaceId, competitors, onDeleteNote } = useContext(CanvasNoteContext);

  const [text, setText] = useState(noteData.text ?? "");
  const [showPinMenu, setShowPinMenu] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pinMenuRef = useRef<HTMLDivElement>(null);

  // Auto-focus when just created
  useEffect(() => {
    if (noteData.animateIn) {
      setTimeout(() => textareaRef.current?.focus(), 120);
    }
  }, [noteData.animateIn]);

  // Close pin menu on outside click
  useEffect(() => {
    if (!showPinMenu) return;
    function onDown(e: MouseEvent) {
      if (pinMenuRef.current && !pinMenuRef.current.contains(e.target as Node)) {
        setShowPinMenu(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [showPinMenu]);

  const persistText = useCallback(
    (value: string) => {
      if (!noteData.noteId) return;
      fetch(`/api/workspaces/${workspaceId}/notes/${noteData.noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value }),
      }).catch(() => {});
    },
    [workspaceId, noteData.noteId],
  );

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setText(val);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persistText(val), 600);
  }

  function handleDelete() {
    if (!noteData.noteId) return;
    fetch(`/api/workspaces/${workspaceId}/notes/${noteData.noteId}`, {
      method: "DELETE",
    }).catch(() => {});
    onDeleteNote(id);
  }

  async function handlePin(nodeId: string | null) {
    setShowPinMenu(false);
    if (!noteData.noteId) return;
    await fetch(`/api/workspaces/${workspaceId}/notes/${noteData.noteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinnedToNodeId: nodeId }),
    }).catch(() => {});
  }

  const pinnedName =
    noteData.pinnedToNodeId
      ? competitors.find((c) => c.id === noteData.pinnedToNodeId)?.name
      : null;

  return (
    <motion.div
      initial={noteData.animateIn ? { opacity: 0, scale: 0.82 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.22, ease: EASE }}
      className="relative flex min-h-[130px] w-[220px] flex-col overflow-visible rounded-xl border border-white/[0.07] bg-zinc-900 shadow-2xl"
    >
      {/* Teal top accent */}
      <div className="h-1 w-full shrink-0 rounded-t-xl bg-[#2dd4bf]" />

      {/* Toolbar row */}
      <div className="nodrag nopan flex items-center gap-1 px-2 pt-1.5 pb-0.5">
        {/* Pin button */}
        <div className="relative">
          <button
            onClick={() => setShowPinMenu((v) => !v)}
            title="Pin to competitor"
            className={[
              "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
              pinnedName
                ? "text-[#2dd4bf] hover:bg-white/[0.06]"
                : "text-zinc-700 hover:bg-white/[0.06] hover:text-zinc-400",
            ].join(" ")}
          >
            <Pin className="h-3 w-3" />
          </button>

          {showPinMenu && (
            <div
              ref={pinMenuRef}
              className="absolute top-full left-0 z-50 mt-1 w-48 overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900 shadow-2xl"
            >
              {competitors.length === 0 ? (
                <p className="px-3 py-2.5 text-xs text-zinc-600">No apps yet</p>
              ) : (
                <>
                  {competitors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handlePin(c.id)}
                      className={[
                        "flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-white/[0.04]",
                        noteData.pinnedToNodeId === c.id
                          ? "text-[#2dd4bf]"
                          : "text-zinc-300",
                      ].join(" ")}
                    >
                      {c.name}
                    </button>
                  ))}
                  {noteData.pinnedToNodeId && (
                    <>
                      <div className="mx-3 h-px bg-white/[0.05]" />
                      <button
                        onClick={() => handlePin(null)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-zinc-600 transition-colors hover:bg-white/[0.04] hover:text-zinc-400"
                      >
                        Unpin
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <span className="flex-1" />

        {/* Delete */}
        <button
          onClick={handleDelete}
          className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-700 transition-colors hover:bg-white/[0.06] hover:text-red-400"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Pinned label */}
      {pinnedName && (
        <div className="nodrag nopan mx-2 mb-1 flex items-center gap-1 rounded-md bg-[#2dd4bf]/10 px-2 py-0.5">
          <Pin className="h-2.5 w-2.5 text-[#2dd4bf]" />
          <span className="truncate text-[10px] text-[#2dd4bf]">{pinnedName}</span>
        </div>
      )}

      {/* Text area */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        placeholder="Add a note…"
        className="nodrag nopan flex-1 resize-none bg-transparent px-3 pb-3 text-[13px] leading-relaxed text-zinc-200 placeholder-zinc-700 outline-none"
      />

      {/* Resize handle when selected */}
      {selected && (
        <NodeResizer
          minWidth={180}
          minHeight={120}
          handleStyle={{ background: "#2dd4bf", borderColor: "#2dd4bf", borderRadius: "3px" }}
          lineStyle={{ border: "1px dashed #2dd4bf33" }}
        />
      )}
    </motion.div>
  );
}
