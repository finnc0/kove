import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string; tierId: string }>;

// POST { featureId, included: boolean } — toggle a feature in/out of a tier
export async function POST(req: Request, { params }: { params: Params }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: workspaceId, tierId } = await params;

  const tier = await prisma.tier.findFirst({
    where: { id: tierId, buildPlan: { workspaceId, workspace: { userId: session.user.id } } },
  });
  if (!tier) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { featureId, included } = await req.json() as { featureId: string; included: boolean };

  if (included) {
    await prisma.tierFeature.upsert({
      where: { tierId_featureId: { tierId, featureId } },
      create: { tierId, featureId },
      update: {},
    });
  } else {
    await prisma.tierFeature.deleteMany({ where: { tierId, featureId } });
  }

  return NextResponse.json({ ok: true });
}
