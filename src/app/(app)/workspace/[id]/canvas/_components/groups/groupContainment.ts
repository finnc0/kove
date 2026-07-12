export interface ContainableNode {
  id: string;
  position: { x: number; y: number };
  measured?: { width?: number; height?: number } | null;
}

export interface ZoneInfo {
  groupId: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  zIndex: number;
}

function nodeCenter(node: ContainableNode): { x: number; y: number } {
  const w = node.measured?.width ?? 240;
  const h = node.measured?.height ?? 160;
  return { x: node.position.x + w / 2, y: node.position.y + h / 2 };
}

function isInsideZone(center: { x: number; y: number }, zone: ZoneInfo): boolean {
  return (
    center.x >= zone.position.x &&
    center.x <= zone.position.x + zone.width &&
    center.y >= zone.position.y &&
    center.y <= zone.position.y + zone.height
  );
}

/**
 * Returns a map of groupId → member node IDs.
 * When a node center falls inside multiple zones, the zone with the highest
 * zIndex wins (frontmost zone owns the node).
 */
export function computeAllMemberships(
  nodes: ContainableNode[],
  zones: ZoneInfo[],
): Map<string, string[]> {
  const result = new Map<string, string[]>(zones.map((z) => [z.groupId, []]));

  for (const node of nodes) {
    const center = nodeCenter(node);
    let winner: ZoneInfo | null = null;
    for (const zone of zones) {
      if (!isInsideZone(center, zone)) continue;
      if (!winner || zone.zIndex > winner.zIndex) winner = zone;
    }
    if (winner) {
      result.get(winner.groupId)!.push(node.id);
    }
  }

  return result;
}
