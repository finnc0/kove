"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

// ─── types ───────────────────────────────────────────────────────────────────

export type CanvasTool =
  | "select"
  | "pan"
  | "add"
  | "note"
  | "group"
  | "filter"
  | "compare";

export interface FilterCondition {
  field: "revenue" | "downloads" | "rating" | "pricing" | "pain";
  op: "gt" | "lt" | "eq" | "contains";
  value: number | string;
}

interface CanvasState {
  activeTool: CanvasTool;
  selectedNodeIds: string[];
  filters: FilterCondition[];
  dimmedNodeIds: string[];
}

type Action =
  | { type: "SET_TOOL"; tool: CanvasTool }
  | { type: "SELECT_NODE"; id: string; multi?: boolean }
  | { type: "DESELECT_ALL" }
  | { type: "SET_FILTERS"; filters: FilterCondition[] }
  | { type: "SET_DIMMED"; ids: string[] }
  | { type: "CLEAR_FILTERS" };

// ─── reducer ─────────────────────────────────────────────────────────────────

const initial: CanvasState = {
  activeTool: "select",
  selectedNodeIds: [],
  filters: [],
  dimmedNodeIds: [],
};

function reducer(state: CanvasState, action: Action): CanvasState {
  switch (action.type) {
    case "SET_TOOL":
      return {
        ...state,
        activeTool: action.tool,
        // Changing tool clears multi-select (except compare keeps its list)
        selectedNodeIds:
          action.tool === "compare" ? state.selectedNodeIds : [],
      };

    case "SELECT_NODE": {
      if (state.activeTool === "compare") {
        // Toggle in multi-select list, cap at 4
        const already = state.selectedNodeIds.includes(action.id);
        const next = already
          ? state.selectedNodeIds.filter((id) => id !== action.id)
          : state.selectedNodeIds.length < 4
            ? [...state.selectedNodeIds, action.id]
            : state.selectedNodeIds;
        return { ...state, selectedNodeIds: next };
      }
      if (action.multi) {
        const already = state.selectedNodeIds.includes(action.id);
        return {
          ...state,
          selectedNodeIds: already
            ? state.selectedNodeIds.filter((id) => id !== action.id)
            : [...state.selectedNodeIds, action.id],
        };
      }
      return {
        ...state,
        selectedNodeIds: state.selectedNodeIds[0] === action.id && state.selectedNodeIds.length === 1
          ? []
          : [action.id],
      };
    }

    case "DESELECT_ALL":
      return { ...state, selectedNodeIds: [] };

    case "SET_FILTERS":
      return { ...state, filters: action.filters };

    case "SET_DIMMED":
      return { ...state, dimmedNodeIds: action.ids };

    case "CLEAR_FILTERS":
      return { ...state, filters: [], dimmedNodeIds: [] };

    default:
      return state;
  }
}

// ─── context ─────────────────────────────────────────────────────────────────

interface CanvasContextValue {
  state: CanvasState;
  setTool: (tool: CanvasTool) => void;
  selectNode: (id: string, multi?: boolean) => void;
  deselectAll: () => void;
  setFilters: (filters: FilterCondition[]) => void;
  setDimmed: (ids: string[]) => void;
  clearFilters: () => void;
}

const CanvasContext = createContext<CanvasContextValue | null>(null);

export function CanvasStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  const setTool = useCallback(
    (tool: CanvasTool) => dispatch({ type: "SET_TOOL", tool }),
    [],
  );
  const selectNode = useCallback(
    (id: string, multi?: boolean) =>
      dispatch({ type: "SELECT_NODE", id, multi }),
    [],
  );
  const deselectAll = useCallback(
    () => dispatch({ type: "DESELECT_ALL" }),
    [],
  );
  const setFilters = useCallback(
    (filters: FilterCondition[]) => dispatch({ type: "SET_FILTERS", filters }),
    [],
  );
  const setDimmed = useCallback(
    (ids: string[]) => dispatch({ type: "SET_DIMMED", ids }),
    [],
  );
  const clearFilters = useCallback(
    () => dispatch({ type: "CLEAR_FILTERS" }),
    [],
  );

  const value = useMemo(
    () => ({ state, setTool, selectNode, deselectAll, setFilters, setDimmed, clearFilters }),
    [state, setTool, selectNode, deselectAll, setFilters, setDimmed, clearFilters],
  );

  return (
    <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
  );
}

export function useCanvasStore() {
  const ctx = useContext(CanvasContext);
  if (!ctx) throw new Error("useCanvasStore must be used inside CanvasStoreProvider");
  return ctx;
}
