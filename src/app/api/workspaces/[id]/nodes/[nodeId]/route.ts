import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string; nodeId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, nodeId } = await params;
  const node = await prisma.node.findFirst({
    where: { id: nodeId, workspaceId: id },
  });
  if (!node) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    ...node,
    report: node.report ? JSON.parse(node.report) : null,
    platform: node.platformBadges ? JSON.parse(node.platformBadges) : [],
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, nodeId } = await params;
  const ws = await prisma.workspace.findFirst({ where: { id, userId: session.user.id } });
  if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.node.delete({ where: { id: nodeId } });

  // Always clear findings — data changed, synthesis must regenerate
  const remaining = await prisma.node.count({ where: { workspaceId: id } });
  await prisma.workspace.update({
    where: { id },
    data: { findings: null, status: remaining === 0 ? "empty" : undefined },
  });

  return NextResponse.json({ ok: true });
}
