import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

// GET — fetch or create the BuildPlan for this workspace
export async function GET(_req: Request, { params }: { params: Params }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: workspaceId } = await params;

  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId: session.user.id },
    select: { id: true, name: true },
  });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const plan = await prisma.buildPlan.findUnique({ where: { workspaceId } });
  return NextResponse.json({ plan });
}

// PATCH — upsert / partially update the BuildPlan
export async function PATCH(req: Request, { params }: { params: Params }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: workspaceId } = await params;

  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId: session.user.id },
    select: { id: true },
  });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await req.json()) as Partial<{
    name: string;
    idea: string;
    ideaSourceGap: string;
    targetUser: string;
    coreValue: string;
    monetization: string;
    platform: string;
    designDirection: string;
    onboardingComplete: boolean;
  }>;

  const allowed = [
    "name", "idea", "ideaSourceGap", "targetUser", "coreValue",
    "monetization", "platform", "designDirection", "onboardingComplete",
  ] as const;

  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  const plan = await prisma.buildPlan.upsert({
    where: { workspaceId },
    create: { workspaceId, ...data },
    update: data,
  });

  return NextResponse.json({ plan });
}
