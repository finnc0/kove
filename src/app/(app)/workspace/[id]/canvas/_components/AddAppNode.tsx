"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Plus } from "lucide-react";

export type AddAppNodeType = Node<Record<string, never>, "addApp">;

const HANDLE_STYLE: React.CSSProperties = {
  background: "transparent",
  border: "none",
  width: 1,
  height: 1,
  minWidth: 1,
  minHeight: 1,
};

export function AddAppNode(_props: NodeProps<AddAppNodeType>) {
  return (
    <>
      <Handle type="source" position={Position.Top} style={HANDLE_STYLE} />
      <Handle type="target" position={Position.Bottom} style={HANDLE_STYLE} />

      <div className="group flex w-72 flex-col items-center gap-4 rounded-2xl border border-dashed border-white/[0.08] bg-transparent px-8 py-10 text-center transition-colors hover:border-white/[0.18]">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.07] bg-zinc-900 transition-colors group-hover:border-[#2dd4bf]/30">
          <Plus className="h-5 w-5 text-zinc-600 transition-colors group-hover:text-[#2dd4bf]" />
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-400 transition-colors group-hover:text-zinc-200">
            Add your first competitor
          </p>
          <p className="mt-1 text-xs text-zinc-600">
            Paste an App Store URL or search by name
          </p>
        </div>
      </div>
    </>
  );
}
