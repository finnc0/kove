import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string; groupId: string }> };

async function ownsGroup(userId: string, workspaceId: string, groupId: string) {
  return prisma.canvasGroup.findFirst({
    where: { id: groupId, workspaceId, workspace: { userId } },
  });
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, groupId } = await params;
  if (!(await ownsGroup(session.user.id, id, groupId)))
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await req.json()) as {
    label?: string;
    color?: string;
    nodeIds?: string[];
    x?: number;
    y?: number;
    collapsed?: boolean;
  };

  const group = await prisma.canvasGroup.update({
    where: { id: groupId },
    data: {
      ...(body.label !== undefined && { label: body.label }),
      ...(body.color !== undefined && { color: body.color }),
      ...(body.nodeIds !== undefined && { nodeIds: JSON.stringify(body.nodeIds) }),
      ...(body.x !== undefined && { x: body.x }),
      ...(body.y !== undefined && { y: body.y }),
      ...(body.collapsed !== undefined && { collapsed: body.collapsed }),
    },
  });
  return NextResponse.json({
    ...group,
    nodeIds: JSON.parse(group.nodeIds) as string[],
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, groupId } = await params;
  if (!(await ownsGroup(session.user.id, id, groupId)))
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.canvasGroup.delete({ where: { id: groupId } });
  return NextResponse.json({ ok: true });
}
