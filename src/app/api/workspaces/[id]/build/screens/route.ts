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
      onboardingScreens: { orderBy: { order: "asc" } },
    },
  });
  if (!buildPlan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ screens: buildPlan.onboardingScreens });
}

export async function POST(req: Request, { params }: { params: Params }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: workspaceId } = await params;

  const buildPlan = await prisma.buildPlan.findFirst({
    where: { workspaceId, workspace: { userId: session.user.id } },
    select: { id: true, onboardingScreens: { select: { order: true } } },
  });
  if (!buildPlan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json() as {
    title: string;
    type?: string;
    purpose?: string;
    notes?: string;
    paywallTierId?: string | null;
  };

  const maxOrder = buildPlan.onboardingScreens.reduce((m, s) => Math.max(m, s.order), -1);

  const screen = await prisma.onboardingScreen.create({
    data: {
      buildPlanId: buildPlan.id,
      title: body.title,
      type: body.type ?? "custom",
      purpose: body.purpose ?? null,
      notes: body.notes ?? null,
      paywallTierId: body.paywallTierId ?? null,
      order: maxOrder + 1,
    },
  });

  return NextResponse.json({ screen }, { status: 201 });
}
