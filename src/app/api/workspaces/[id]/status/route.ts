import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const workspace = await prisma.workspace.findFirst({
    where: { id, userId: session.user.id },
    include: { nodes: { orderBy: { createdAt: "asc" } } },
  });

  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  type DbNode = typeof workspace.nodes[number];
  const completedCount = workspace.nodes.filter((n: DbNode) => n.status === "complete").length;
  const analyzingCount = workspace.nodes.filter((n: DbNode) => n.status === "analyzing").length;

  let status = workspace.status;
  if (completedCount === 0 && analyzingCount === 0) status = "empty";
  else if (analyzingCount > 0 || completedCount < workspace.nodes.length) status = "building";
  else if (completedCount >= 1) status = "ready";

  return NextResponse.json({
    id: workspace.id,
    name: workspace.name,
    status,
    nodes: workspace.nodes.map((n: DbNode) => ({
      id: n.id,
      name: n.name,
      status: n.status,
      platform: n.platformBadges ? JSON.parse(n.platformBadges) : [],
      iconUrl: n.iconUrl,
      updatedAt: n.updatedAt,
    })),
    completedCount,
    findings: workspace.findings ? JSON.parse(workspace.findings) : null,
    opportunitySnippet: workspace.opportunitySnippet,
  });
}
