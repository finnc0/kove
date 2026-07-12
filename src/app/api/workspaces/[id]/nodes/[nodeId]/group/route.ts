import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string; nodeId: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, nodeId } = await params;

  const node = await prisma.node.findFirst({
    where: { id: nodeId, workspaceId: id, workspace: { userId: session.user.id } },
    select: { id: true },
  });
  if (!node) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await req.json()) as { groupId: string | null };

  await prisma.node.update({
    where: { id: nodeId },
    data: { groupId: body.groupId ?? null },
  });

  return NextResponse.json({ ok: true });
}
