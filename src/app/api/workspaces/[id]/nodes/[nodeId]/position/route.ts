import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string; nodeId: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, nodeId } = await params;

  // Verify workspace ownership
  const ws = await prisma.workspace.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json() as { x: number; y: number };
  if (typeof body.x !== "number" || typeof body.y !== "number")
    return NextResponse.json({ error: "x and y required" }, { status: 400 });

  await prisma.node.updateMany({
    where: { id: nodeId, workspaceId: id },
    data: { canvasX: body.x, canvasY: body.y },
  });

  return NextResponse.json({ ok: true });
}
