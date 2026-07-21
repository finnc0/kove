import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type Params = Promise<{ id: string; screenId: string }>;

export async function POST(_req: Request, { params }: { params: Params }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: workspaceId, screenId } = await params;

  const screen = await prisma.onboardingScreen.findFirst({
    where: { id: screenId, buildPlan: { workspaceId, workspace: { userId: session.user.id } } },
    include: {
      buildPlan: {
        select: { idea: true, targetUser: true, coreValue: true, platform: true },
      },
      paywallTier: { select: { name: true } },
    },
  });
  if (!screen) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const plan = screen.buildPlan;

  const context = [
    `App: ${plan.idea ?? "unknown"}`,
    `Target user: ${plan.targetUser ?? "unknown"}`,
    `Core value: ${plan.coreValue ?? "unknown"}`,
    `Platform: ${plan.platform ?? "unknown"}`,
    `Screen title: ${screen.title}`,
    `Screen type: ${screen.type}`,
    screen.purpose ? `Purpose: ${screen.purpose}` : "",
    screen.paywallTier ? `Paywall tier: ${screen.paywallTier.name}` : "",
    screen.notes ? `Notes: ${screen.notes}` : "",
  ].filter(Boolean).join("\n");

  const prompt = `You are a product engineer helping a founder plan their app screens. Write a concise, implementation-ready build prompt for the following screen.

${context}

The prompt should:
- Describe what this screen shows and what the user can do
- Specify key UI elements needed (inputs, buttons, lists, etc.)
- Note any conditional logic (e.g. gated by a paywall tier, only shows after step X)
- Be 150–250 words
- Be written so an engineer (or AI coding tool) can implement it directly
- No code, no headers, just prose`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    const aiPrompt = (message.content[0] as { type: string; text: string }).text?.trim() ?? "";

    await prisma.onboardingScreen.update({ where: { id: screenId }, data: { aiPrompt } });
    return NextResponse.json({ aiPrompt });
  } catch {
    return NextResponse.json({ error: "Failed to generate prompt" }, { status: 500 });
  }
}
