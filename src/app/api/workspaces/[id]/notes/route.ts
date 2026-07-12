import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

async function ownsWorkspace(userId: string, workspaceId: string) {
  return prisma.workspace.findFirst({
    where: { id: workspaceId, userId },
    select: { id: true },
  });
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await ownsWorkspace(session.user.id, id)))
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const notes = await prisma.canvasNote.findMany({
    where: { workspaceId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(notes);
}

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await ownsWorkspace(session.user.id, id)))
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json() as {
    text?: string;
    x?: number;
    y?: number;
    pinnedToNodeId?: string | null;
  };

  const note = await prisma.canvasNote.create({
    data: {
      workspaceId: id,
      text: body.text ?? "",
      x: body.x ?? 0,
      y: body.y ?? 0,
      pinnedToNodeId: body.pinnedToNodeId ?? null,
    },
  });
  return NextResponse.json(note, { status: 201 });
}
