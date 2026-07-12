import { WorkspaceRow } from "./WorkspaceRow";
import type { Workspace } from "./WorkspaceRow";

interface Props {
  workspaces: Workspace[];
}

export function WorkspaceList({ workspaces }: Props) {
  return (
    <div className="space-y-2">
      {workspaces.map((w) => (
        <WorkspaceRow key={w.id} workspace={w} />
      ))}
    </div>
  );
}
