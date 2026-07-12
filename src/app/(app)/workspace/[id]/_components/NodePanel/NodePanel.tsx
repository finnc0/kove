import { Plus } from "lucide-react";
import { NodeCard } from "./NodeCard";
import type { WorkspaceNode } from "../../mockData";

interface Props {
  nodes: WorkspaceNode[];
  activeNodeId: string | null;
  onSelectNode: (id: string) => void;
  onAddNode: () => void;
  onRemoveNode: (id: string) => void;
  onReanalyzeNode: (id: string) => void;
}

export function NodePanel({ nodes, activeNodeId, onSelectNode, onAddNode, onRemoveNode, onReanalyzeNode }: Props) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/[0.06] flex items-center shrink-0">
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
          Apps & Sites
        </span>
        <span className="text-xs text-zinc-700 ml-2">({nodes.length})</span>
      </div>

      {/* Node list */}
      <div className="flex-1 overflow-y-auto py-2 px-2 scrollbar-dark">
        {nodes.length === 0 ? (
          <p className="text-xs text-zinc-600 text-center py-8 px-4 leading-relaxed">
            Add your first app or site to start building your research canvas
          </p>
        ) : (
          <div className="space-y-0.5">
            {nodes.map((node) => (
              <NodeCard
                key={node.id}
                node={node}
                isActive={activeNodeId === node.id}
                onSelect={onSelectNode}
                onRemove={onRemoveNode}
                onReanalyze={onReanalyzeNode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add node button */}
      <div className="border-t border-white/[0.06] p-3 shrink-0">
        <button
          onClick={onAddNode}
          className="w-full border border-dashed border-white/[0.12] rounded-lg py-2.5 text-sm text-zinc-500 hover:border-white/25 hover:text-zinc-300 hover:bg-white/[0.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add app or site
        </button>
      </div>
    </div>
  );
}
