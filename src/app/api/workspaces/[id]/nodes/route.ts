import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAddCompetitor } from "@/lib/entitlements";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const ws = await prisma.workspace.findFirst({ where: { id, userId: session.user.id } });
  if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const nodes = await prisma.node.findMany({
    where: { workspaceId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(nodes);
}

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const ws = await prisma.workspace.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, lifetimeNodesCreated: true },
  });
  if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const billingUser = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { subscriptionTier: true, subscriptionStatus: true, trialEndsAt: true },
  });

  const gate = canAddCompetitor(billingUser, ws.lifetimeNodesCreated);
  if (!gate.allowed) {
    return NextResponse.json({ error: "upgrade_required", gate: gate.gate }, { status: 402 });
  }

  const { urlApp, urlSite, type, name } = await req.json();

  const [node] = await prisma.$transaction([
    prisma.node.create({
      data: {
        workspaceId: id,
        urlApp: urlApp || null,
        urlSite: urlSite || null,
        type: type || "ios",
        name: name || null,
        status: "pending",
      },
    }),
    prisma.workspace.update({
      where: { id },
      data: {
        status: "building",
        findings: null,
        lifetimeNodesCreated: { increment: 1 },
      },
    }),
  ]);

  return NextResponse.json(node, { status: 201 });
}
