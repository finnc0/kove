import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

export async function GET(_req: Request, { params }: { params: Params }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: workspaceId } = await params;

  const buildPlan = await prisma.buildPlan.findFirst({
    where: { workspaceId, workspace: { userId: session.user.id } },
    select: {
      id: true,
      tiers: {
        orderBy: { order: "asc" },
        include: { tierFeatures: { select: { featureId: true } } },
      },
    },
  });
  if (!buildPlan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ tiers: buildPlan.tiers });
}

export async function POST(req: Request, { params }: { params: Params }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: workspaceId } = await params;

  const buildPlan = await prisma.buildPlan.findFirst({
    where: { workspaceId, workspace: { userId: session.user.id } },
    select: { id: true, tiers: { select: { order: true } } },
  });
  if (!buildPlan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json() as { name: string; prices?: Record<string, string>; notes?: string };
  const maxOrder = buildPlan.tiers.reduce((m, t) => Math.max(m, t.order), -1);

  const tier = await prisma.tier.create({
    data: {
      buildPlanId: buildPlan.id,
      name: body.name,
      order: maxOrder + 1,
      prices: body.prices ?? {},
      notes: body.notes ?? null,
    },
    include: { tierFeatures: { select: { featureId: true } } },
  });

  return NextResponse.json({ tier }, { status: 201 });
}
