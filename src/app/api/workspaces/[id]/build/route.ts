import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

// GET — fetch the BuildPlan for this workspace
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

// PATCH — upsert / partially update the BuildPlan.
// When onboardingComplete transitions to true, seeds starter data.
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

  const wasComplete = body.onboardingComplete === true;

  // Check if already seeded (plan exists + onboardingComplete already true)
  const existing = await prisma.buildPlan.findUnique({
    where: { workspaceId },
    select: { id: true, onboardingComplete: true },
  });
  const alreadySeeded = existing?.onboardingComplete === true;

  const plan = await prisma.buildPlan.upsert({
    where: { workspaceId },
    create: { workspaceId, ...data },
    update: data,
    include: { features: true, paywallRules: true },
  });

  // Seed starter content on first completion
  if (wasComplete && !alreadySeeded) {
    await seedOnCompletion(plan.id, body);
  }

  return NextResponse.json({ plan });
}

async function seedOnCompletion(
  buildPlanId: string,
  answers: {
    coreValue?: string;
    idea?: string;
    ideaSourceGap?: string;
    monetization?: string;
    platform?: string;
  },
) {
  const seeds: Promise<unknown>[] = [];

  // Seed a core feature from coreValue
  if (answers.coreValue) {
    seeds.push(
      prisma.feature.create({
        data: {
          buildPlanId,
          title: answers.coreValue,
          description: "Your core value proposition — the one thing the app has to do.",
          category: "core",
          priority: 0,
          sourceGap: answers.ideaSourceGap ?? null,
        },
      }),
    );
  }

  // If idea came from a gap, also seed a research-sourced feature for that gap
  if (answers.ideaSourceGap && answers.idea && answers.ideaSourceGap !== answers.idea) {
    seeds.push(
      prisma.feature.create({
        data: {
          buildPlanId,
          title: `Gap: ${answers.ideaSourceGap}`,
          description:
            "Seeded from market research — a real unmet need your app addresses.",
          category: "core",
          priority: 1,
          sourceGap: answers.ideaSourceGap,
        },
      }),
    );
  }

  // Seed initial paywall tier from monetization choice
  if (answers.monetization && answers.monetization !== "free" && answers.monetization !== "unsure") {
    const tierName =
      answers.monetization === "freemium"
        ? "Pro"
        : answers.monetization === "subscription"
          ? "Starter"
          : "Full";

    seeds.push(
      prisma.paywallRule.create({
        data: {
          buildPlanId,
          tierName,
          gatedFeatureIds: [],
          price: null,
        },
      }),
    );
  }

  await Promise.all(seeds);
}
