import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string; tierId: string }>;

export async function PATCH(req: Request, { params }: { params: Params }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: workspaceId, tierId } = await params;

  const tier = await prisma.tier.findFirst({
    where: { id: tierId, buildPlan: { workspaceId, workspace: { userId: session.user.id } } },
  });
  if (!tier) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json() as { name?: string; prices?: Record<string, string>; notes?: string; order?: number };
  const data: Record<string, unknown> = {};
  if ("name" in body)   data.name   = body.name;
  if ("prices" in body) data.prices = body.prices;
  if ("notes" in body)  data.notes  = body.notes;
  if ("order" in body)  data.order  = body.order;

  const updated = await prisma.tier.update({ where: { id: tierId }, data });
  return NextResponse.json({ tier: updated });
}

export async function DELETE(_req: Request, { params }: { params: Params }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: workspaceId, tierId } = await params;

  const tier = await prisma.tier.findFirst({
    where: { id: tierId, buildPlan: { workspaceId, workspace: { userId: session.user.id } } },
  });
  if (!tier) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.tier.delete({ where: { id: tierId } });
  return NextResponse.json({ ok: true });
}
