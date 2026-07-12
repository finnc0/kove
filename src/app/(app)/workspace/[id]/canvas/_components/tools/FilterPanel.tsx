"use client";

import { useEffect, useRef, useState } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { useCanvasStore, type FilterCondition } from "../../_store/canvasStore";
import type { CanvasAppNode } from "../types";

interface Props {
  appNodes: CanvasAppNode[];
  onClose: () => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;

type Field = FilterCondition["field"];
type Op = FilterCondition["op"];

const FIELD_LABELS: Record<Field, string> = {
  rating:    "Rating",
  revenue:   "Est. revenue",
  downloads: "Est. downloads",
  pricing:   "Pricing model",
  pain:      "Top pain keyword",
};

const OP_LABELS: Record<Op, string> = {
  gt:       ">",
  lt:       "<",
  eq:       "=",
  contains: "contains",
};

const NUMERIC_FIELDS: Field[] = ["rating", "revenue", "downloads"];
const TEXT_FIELDS: Field[] = ["pricing", "pain"];

function matchNode(node: CanvasAppNode, cond: FilterCondition): boolean {
  if (node.nodeStatus !== "complete") return false;
  switch (cond.field) {
    case "rating": {
      const v = node.rating ?? 0;
      const n = Number(cond.value);
      if (cond.op === "gt") return v > n;
      if (cond.op === "lt") return v < n;
      return Math.abs(v - n) < 0.05;
    }
    case "revenue": {
      const v = node.rawRevenue ?? 0;
      const n = Number(cond.value);
      if (cond.op === "gt") return v > n;
      if (cond.op === "lt") return v < n;
      return v === n;
    }
    case "downloads": {
      const v = node.rawDownloads ?? 0;
      const n = Number(cond.value);
      if (cond.op === "gt") return v > n;
      if (cond.op === "lt") return v < n;
      return v === n;
    }
    case "pricing": {
      const model = node.report?.pricingModel ?? "";
      return model.toLowerCase().includes(String(cond.value).toLowerCase());
    }
    case "pain": {
      const title = node.topPainTitle ?? "";
      return title.toLowerCase().includes(String(cond.value).toLowerCase());
    }
  }
}

interface RowProps {
  cond: FilterCondition;
  onChange: (c: FilterCondition) => void;
  onRemove: () => void;
}

function ConditionRow({ cond, onChange, onRemove }: RowProps) {
  const isText = TEXT_FIELDS.includes(cond.field);
  const ops: Op[] = isText ? ["contains"] : ["gt", "lt", "eq"];

  return (
    <div className="flex items-center gap-2">
      {/* Field */}
      <select
        value={cond.field}
        onChange={(e) =>
          onChange({
            ...cond,
            field: e.target.value as Field,
            op: TEXT_FIELDS.includes(e.target.value as Field) ? "contains" : "gt",
            value: "",
          })
        }
        className="flex-1 rounded-lg border border-white/[0.07] bg-zinc-800 px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-[#2dd4bf]/40"
      >
        {(Object.keys(FIELD_LABELS) as Field[]).map((f) => (
          <option key={f} value={f}>{FIELD_LABELS[f]}</option>
        ))}
      </select>

      {/* Op */}
      <select
        value={cond.op}
        onChange={(e) => onChange({ ...cond, op: e.target.value as Op })}
        className="w-[52px] rounded-lg border border-white/[0.07] bg-zinc-800 px-2 py-1.5 text-center text-xs text-zinc-200 outline-none focus:border-[#2dd4bf]/40"
      >
        {ops.map((o) => (
          <option key={o} value={o}>{OP_LABELS[o]}</option>
        ))}
      </select>

      {/* Value */}
      <input
        type={isText ? "text" : "number"}
        value={String(cond.value)}
        onChange={(e) => onChange({ ...cond, value: isText ? e.target.value : Number(e.target.value) })}
        placeholder={isText ? "e.g. subscription" : "0"}
        className="w-20 rounded-lg border border-white/[0.07] bg-zinc-800 px-2 py-1.5 text-xs text-zinc-200 placeholder-zinc-700 outline-none focus:border-[#2dd4bf]/40"
      />

      <button
        onClick={onRemove}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-zinc-700 transition-colors hover:bg-white/[0.04] hover:text-zinc-400"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

export function FilterPanel({ appNodes, onClose }: Props) {
  const { state, setFilters, setDimmed, clearFilters, setTool } = useCanvasStore();
  const ref = useRef<HTMLDivElement>(null);

  const [conditions, setConditions] = useState<FilterCondition[]>(
    state.filters.length > 0
      ? state.filters
      : [{ field: "rating", op: "gt", value: 4 }],
  );

  // Re-apply filters whenever conditions change
  useEffect(() => {
    if (conditions.length === 0) {
      clearFilters();
      return;
    }
    const validConditions = conditions.filter((c) => c.value !== "" && c.value !== 0 || c.field === "pain" || c.field === "pricing");
    if (validConditions.length === 0) return;

    setFilters(validConditions);
    const matchedIds = appNodes
      .filter((n) => validConditions.every((c) => matchNode(n, c)))
      .map((n) => n.id);
    const dimmed = appNodes
      .filter((n) => !matchedIds.includes(n.id))
      .map((n) => n.id);
    setDimmed(dimmed);
  }, [conditions, appNodes, setFilters, setDimmed, clearFilters]);

  function addCondition() {
    setConditions((prev) => [...prev, { field: "rating", op: "gt", value: 4 }]);
  }

  function updateCondition(i: number, c: FilterCondition) {
    setConditions((prev) => prev.map((x, idx) => (idx === i ? c : x)));
  }

  function removeCondition(i: number) {
    const next = conditions.filter((_, idx) => idx !== i);
    setConditions(next);
    if (next.length === 0) {
      clearFilters();
    }
  }

  function handleClear() {
    clearFilters();
    setConditions([]);
    setTool("select");
    onClose();
  }

  function handleClose() {
    onClose();
  }

  // Count how many nodes match
  const matchCount = appNodes.filter((n) =>
    conditions.length === 0 || conditions.every((c) => matchNode(n, c)),
  ).length;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -8, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -6, scale: 0.98 }}
      transition={{ duration: 0.18, ease: EASE }}
      className="absolute left-full top-0 z-50 ml-2.5 w-80 overflow-hidden rounded-2xl border border-white/[0.07] bg-zinc-900/95 shadow-2xl backdrop-blur-md"
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-500" />
        <span className="flex-1 text-sm font-medium text-zinc-200">Filter nodes</span>
        <button
          onClick={handleClose}
          className="flex h-6 w-6 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-white/[0.06] hover:text-zinc-300"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Conditions */}
      <div className="flex flex-col gap-2 p-4">
        {conditions.length === 0 ? (
          <p className="text-xs text-zinc-600">No conditions — all nodes visible.</p>
        ) : (
          conditions.map((c, i) => (
            <ConditionRow
              key={i}
              cond={c}
              onChange={(updated) => updateCondition(i, updated)}
              onRemove={() => removeCondition(i)}
            />
          ))
        )}

        <button
          onClick={addCondition}
          className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/[0.08] py-2 text-xs text-zinc-600 transition-colors hover:border-white/[0.14] hover:text-zinc-400"
        >
          + Add condition
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-3">
        <span className="text-xs text-zinc-600">
          {matchCount} of {appNodes.length} nodes match
        </span>
        <button
          onClick={handleClear}
          className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
        >
          Clear filter
        </button>
      </div>
    </motion.div>
  );
}
