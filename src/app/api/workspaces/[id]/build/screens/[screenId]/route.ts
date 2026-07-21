import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string; screenId: string }>;

const ALLOWED_PATCH = new Set([
  "title", "type", "purpose", "notes", "order", "paywallTierId", "wireframeJson", "aiPrompt",
]);

export async function PATCH(req: Request, { params }: { params: Params }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: workspaceId, screenId } = await params;

  const screen = await prisma.onboardingScreen.findFirst({
    where: { id: screenId, buildPlan: { workspaceId, workspace: { userId: session.user.id } } },
  });
  if (!screen) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json() as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  for (const key of Object.keys(body)) {
    if (ALLOWED_PATCH.has(key)) data[key] = body[key];
  }

  const updated = await prisma.onboardingScreen.update({ where: { id: screenId }, data });
  return NextResponse.json({ screen: updated });
}

export async function DELETE(_req: Request, { params }: { params: Params }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: workspaceId, screenId } = await params;

  const screen = await prisma.onboardingScreen.findFirst({
    where: { id: screenId, buildPlan: { workspaceId, workspace: { userId: session.user.id } } },
  });
  if (!screen) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.onboardingScreen.delete({ where: { id: screenId } });
  return NextResponse.json({ ok: true });
}
