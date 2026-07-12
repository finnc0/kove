"use client";

import { createContext } from "react";

export interface NoteContextCompetitor {
  id: string;
  name: string;
}

export interface CanvasNoteContextValue {
  workspaceId: string;
  competitors: NoteContextCompetitor[];
  onDeleteNote: (rfNodeId: string) => void;
}

export const CanvasNoteContext = createContext<CanvasNoteContextValue>({
  workspaceId: "",
  competitors: [],
  onDeleteNote: () => {},
});
