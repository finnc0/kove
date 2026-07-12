import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

async function getWorkspaceForUser(id: string, userId: string) {
  return prisma.workspace.findFirst({ where: { id, userId } });
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const workspace = await prisma.workspace.findFirst({
    where: { id, userId: session.user.id },
    include: { nodes: { orderBy: { createdAt: "asc" } } },
  });

  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(workspace);
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const ws = await getWorkspaceForUser(id, session.user.id);
  if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { name } = await req.json();
  const updated = await prisma.workspace.update({ where: { id }, data: { name: name?.trim() } });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const ws = await getWorkspaceForUser(id, session.user.id);
  if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.workspace.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
