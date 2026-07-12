import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { IOSRawData, RawReview } from "@/lib/analysis/ios";

type Params = { params: Promise<{ id: string; nodeId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, nodeId } = await params;
  const ws = await prisma.workspace.findFirst({ where: { id, userId: session.user.id } });
  if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const node = await prisma.node.findFirst({ where: { id: nodeId, workspaceId: id }, select: { rawData: true } });
  if (!node?.rawData) return NextResponse.json({ reviews: [] });

  const raw: IOSRawData = JSON.parse(node.rawData);
  const all: RawReview[] = [...raw.reviews.negative, ...raw.reviews.positive]
    .sort((a, b) => b.voteSum - a.voteSum);

  return NextResponse.json({ reviews: all });
}
