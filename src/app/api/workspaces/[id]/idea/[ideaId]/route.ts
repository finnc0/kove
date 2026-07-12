import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string; ideaId: string }> };

async function getOwned(userId: string, workspaceId: string, ideaId: string) {
  return prisma.ideaNode.findFirst({
    where: { id: ideaId, workspaceId, workspace: { userId } },
  });
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, ideaId } = await params;
  const idea = await getOwned(session.user.id, id, ideaId);
  if (!idea) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await req.json()) as {
    text?: string;
    targetUser?: string;
    keyFeature?: string;
    x?: number;
    y?: number;
  };

  const updated = await prisma.ideaNode.update({
    where: { id: ideaId },
    data: {
      ...(body.text !== undefined && { text: body.text }),
      ...(body.targetUser !== undefined && { targetUser: body.targetUser }),
      ...(body.keyFeature !== undefined && { keyFeature: body.keyFeature }),
      ...(body.x !== undefined && { x: body.x }),
      ...(body.y !== undefined && { y: body.y }),
    },
  });

  return NextResponse.json({
    ...updated,
    evaluationJson: updated.evaluationJson
      ? (JSON.parse(updated.evaluationJson) as unknown)
      : null,
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, ideaId } = await params;
  const idea = await getOwned(session.user.id, id, ideaId);
  if (!idea) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.ideaNode.delete({ where: { id: ideaId } });
  return NextResponse.json({ ok: true });
}
