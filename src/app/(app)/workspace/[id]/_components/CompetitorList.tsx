import { CompetitorRow } from "./CompetitorRow";
import { AddCompetitorRow } from "./AddCompetitorRow";

export interface CompetitorNode {
  id: string;
  name: string;
  iconUrl: string | null;
  nodeStatus: "pending" | "analyzing" | "complete" | "failed";
  downloads: string | null;
  revenue: string | null;
  rating: number | null;
}

interface Props {
  workspaceId: string;
  nodes: CompetitorNode[];
  competitorCount?: number;
  canAddCompetitor?: boolean;
  hasUsedTrial?: boolean;
}

export function CompetitorList({ workspaceId, nodes, competitorCount, canAddCompetitor, hasUsedTrial }: Props) {
  return (
    <div className="flex flex-col gap-5">
      {/* Section heading */}
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-600">
          Competitors
        </h2>
        {nodes.length > 0 && (
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-500">
            {nodes.length}
          </span>
        )}
      </div>

      {/* Competitor rows — scrollable when list grows */}
      {nodes.length > 0 && (
        <div
          className="space-y-2 overflow-y-auto"
          style={{ maxHeight: "340px", scrollbarWidth: "none" } as React.CSSProperties}
        >
          {nodes.map((n) => (
            <CompetitorRow
              key={n.id}
              id={n.id}
              workspaceId={workspaceId}
              name={n.name}
              iconUrl={n.iconUrl}
              nodeStatus={n.nodeStatus}
              downloads={n.downloads}
              revenue={n.revenue}
              rating={n.rating}
            />
          ))}
        </div>
      )}

      <AddCompetitorRow
        workspaceId={workspaceId}
        competitorCount={competitorCount ?? nodes.length}
        canAddCompetitor={canAddCompetitor}
        hasUsedTrial={hasUsedTrial}
      />
    </div>
  );
}
