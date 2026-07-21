import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

export async function POST(req: Request, { params }: { params: Params }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: workspaceId } = await params;

  // Verify workspace ownership
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId: session.user.id },
    select: { buildPlan: { select: { id: true } } },
  });
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!workspace.buildPlan) return NextResponse.json({ error: "No build plan" }, { status: 400 });

  const body = await req.json() as {
    buildPlanId?: string;
    title: string;
    description?: string;
    category?: string;
    sourceGap?: string;
    priority?: number;
  };

  const feature = await prisma.feature.create({
    data: {
      buildPlanId: workspace.buildPlan.id,
      title: body.title,
      description: body.description ?? null,
      category: body.category ?? "core",
      sourceGap: body.sourceGap ?? null,
      priority: body.priority ?? 0,
    },
  });

  return NextResponse.json({ feature });
}
