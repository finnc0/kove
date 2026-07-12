import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isPro } from "@/lib/entitlements";

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

  const idea = await prisma.ideaNode.findFirst({
    where: { workspaceId: id },
    orderBy: { createdAt: "asc" },
  });

  if (!idea) return NextResponse.json(null);

  return NextResponse.json({
    ...idea,
    evaluationJson: idea.evaluationJson ? JSON.parse(idea.evaluationJson) : null,
  });
}

// POST = always creates a new idea node (Pro only)
export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await ownsWorkspace(session.user.id, id)))
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const billingUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscriptionTier: true, subscriptionStatus: true, trialEndsAt: true },
  });
  if (!isPro(billingUser ?? { subscriptionTier: "explorer", subscriptionStatus: "free", trialEndsAt: null }))
    return NextResponse.json({ error: "upgrade_required", gate: "idea_evaluation" }, { status: 403 });

  const body = (await req.json()) as {
    text?: string;
    targetUser?: string;
    keyFeature?: string;
    x?: number;
    y?: number;
  };

  const created = await prisma.ideaNode.create({
    data: {
      workspaceId: id,
      text: body.text ?? "",
      targetUser: body.targetUser ?? null,
      keyFeature: body.keyFeature ?? null,
      x: body.x ?? 600,
      y: body.y ?? 100,
    },
  });

  return NextResponse.json(created);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await ownsWorkspace(session.user.id, id)))
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await prisma.ideaNode.findFirst({ where: { workspaceId: id } });
  if (existing) {
    await prisma.ideaNode.delete({ where: { id: existing.id } });
  }

  return NextResponse.json({ ok: true });
}
