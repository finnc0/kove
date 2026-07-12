import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "./_components/DashboardHeader";
import { WorkspaceGrid } from "./_components/WorkspaceGrid";
import { EmptyState } from "./_components/EmptyState";
import type { Workspace } from "./_components/WorkspaceCard";

export const metadata: Metadata = { title: "Dashboard — Kove" };

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const rows = userId
    ? await prisma.workspace.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        include: {
          nodes: {
            select: { iconUrl: true, name: true },
            take: 8,
          },
          _count: { select: { nodes: true } },
        },
      })
    : [];

  const workspaces: Workspace[] = rows.map((w) => {
    // Parse shared pain point count from findings JSON
    let painPointCount = 0;
    if (w.findings) {
      try {
        const parsed = JSON.parse(w.findings) as { painPoints?: unknown[] };
        if (Array.isArray(parsed.painPoints)) {
          painPointCount = parsed.painPoints.length;
        }
      } catch {
        // ignore malformed JSON
      }
    }

    const updatedAt = new Date(w.updatedAt);
    const diffMs = Date.now() - updatedAt.getTime();
    const diffHrs = Math.floor(diffMs / 3_600_000);
    const lastUpdated =
      diffHrs < 1
        ? "just now"
        : diffHrs < 24
          ? `${diffHrs}h ago`
          : `${Math.floor(diffHrs / 24)}d ago`;

    return {
      id: w.id,
      name: w.name,
      nodeCount: w._count.nodes,
      nodes: w.nodes,
      status: (
        w.status === "ready"
          ? "ready"
          : w.status === "building"
            ? "building"
            : "empty"
      ) as Workspace["status"],
      lastUpdated,
      opportunitySnippet: w.opportunitySnippet ?? null,
      painPointCount,
    };
  });

  return (
    <div className="mx-auto max-w-6xl px-8 py-12">
      <DashboardHeader count={workspaces.length} />
      {workspaces.length === 0 ? (
        <EmptyState />
      ) : (
        <WorkspaceGrid workspaces={workspaces} />
      )}
    </div>
  );
}
