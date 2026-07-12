import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string; noteId: string }> };

async function ownsNote(userId: string, workspaceId: string, noteId: string) {
  return prisma.canvasNote.findFirst({
    where: { id: noteId, workspaceId, workspace: { userId } },
  });
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, noteId } = await params;
  if (!(await ownsNote(session.user.id, id, noteId)))
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json() as {
    text?: string;
    x?: number;
    y?: number;
    pinnedToNodeId?: string | null;
  };

  const note = await prisma.canvasNote.update({
    where: { id: noteId },
    data: {
      ...(body.text !== undefined && { text: body.text }),
      ...(body.x !== undefined && { x: body.x }),
      ...(body.y !== undefined && { y: body.y }),
      ...(body.pinnedToNodeId !== undefined && { pinnedToNodeId: body.pinnedToNodeId }),
    },
  });
  return NextResponse.json(note);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, noteId } = await params;
  if (!(await ownsNote(session.user.id, id, noteId)))
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.canvasNote.delete({ where: { id: noteId } });
  return NextResponse.json({ ok: true });
}
