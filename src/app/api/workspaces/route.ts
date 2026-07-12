import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canCreateWorkspace } from "@/lib/entitlements";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaces = await prisma.workspace.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { nodes: true } } },
  });

  return NextResponse.json(workspaces);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, brief } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: {
      subscriptionTier: true,
      subscriptionStatus: true,
      trialEndsAt: true,
      lifetimeWorkspacesCreated: true,
    },
  });

  const gate = canCreateWorkspace(user, user.lifetimeWorkspacesCreated);
  if (!gate.allowed) {
    return NextResponse.json({ error: "upgrade_required", gate: gate.gate }, { status: 402 });
  }

  const [workspace] = await prisma.$transaction([
    prisma.workspace.create({
      data: { userId: session.user.id, name: name.trim(), brief: brief?.trim() || null, status: "empty" },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { lifetimeWorkspacesCreated: { increment: 1 } },
    }),
  ]);

  return NextResponse.json(workspace, { status: 201 });
}
