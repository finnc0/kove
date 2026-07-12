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

  const groups = await prisma.canvasGroup.findMany({
    where: { workspaceId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(
    groups.map((g) => ({
      ...g,
      nodeIds: JSON.parse(g.nodeIds) as string[],
    })),
  );
}

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await ownsWorkspace(session.user.id, id)))
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await req.json()) as {
    label?: string;
    color?: string;
    nodeIds?: string[];
    x?: number;
    y?: number;
  };

  const group = await prisma.canvasGroup.create({
    data: {
      workspaceId: id,
      label: body.label ?? "New group",
      color: body.color ?? "zinc",
      nodeIds: JSON.stringify(body.nodeIds ?? []),
      x: body.x ?? 100,
      y: body.y ?? 100,
    },
  });
  return NextResponse.json(
    { ...group, nodeIds: JSON.parse(group.nodeIds) as string[] },
    { status: 201 },
  );
}
