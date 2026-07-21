import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string; featureId: string }>;

async function getOwned(workspaceId: string, userId: string, featureId: string) {
  return prisma.feature.findFirst({
    where: {
      id: featureId,
      buildPlan: { workspaceId, workspace: { userId } },
    },
  });
}

export async function PATCH(req: Request, { params }: { params: Params }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: workspaceId, featureId } = await params;

  const feature = await getOwned(workspaceId, session.user.id, featureId);
  if (!feature) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json() as Partial<{
    title: string; description: string; category: string;
    priority: number; columnId: string; status: string; buildPrompt: string;
  }>;

  const allowed = ["title", "description", "category", "priority", "columnId", "status", "buildPrompt"] as const;
  const data: Record<string, unknown> = {};
  for (const k of allowed) { if (k in body) data[k] = body[k]; }

  const updated = await prisma.feature.update({ where: { id: featureId }, data });
  return NextResponse.json({ feature: updated });
}

export async function DELETE(_req: Request, { params }: { params: Params }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: workspaceId, featureId } = await params;

  const feature = await getOwned(workspaceId, session.user.id, featureId);
  if (!feature) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.feature.delete({ where: { id: featureId } });
  return NextResponse.json({ ok: true });
}
