import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type Params = Promise<{ id: string; featureId: string }>;

export async function POST(_req: Request, { params }: { params: Params }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: workspaceId, featureId } = await params;

  const feature = await prisma.feature.findFirst({
    where: {
      id: featureId,
      buildPlan: { workspaceId, workspace: { userId: session.user.id } },
    },
    include: {
      buildPlan: { select: { idea: true, targetUser: true, platform: true } },
    },
  });
  if (!feature) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const prompt = `Write a clear, implementation-ready build prompt for the following app feature. This prompt is for the founder to take to their own developer or AI coding tool — it should describe WHAT to build and WHY, not HOW to build it (no code).

App context:
- Idea: ${feature.buildPlan.idea ?? "unknown"}
- Target user: ${feature.buildPlan.targetUser ?? "unknown"}
- Platform: ${feature.buildPlan.platform ?? "unknown"}

Feature to describe:
- Title: ${feature.title}
- Description: ${feature.description ?? "(none provided)"}
- Category: ${feature.category}
${feature.sourceGap ? `- From research: ${feature.sourceGap}` : ""}

Write a build prompt that:
1. Clearly describes the feature's purpose and what it should do
2. Defines the user interaction (what the user sees, what they do, what happens)
3. Notes any key constraints or edge cases
4. Includes acceptance criteria (how you know it's done)

Keep it concise — 150-250 words. Plain text, no markdown headings or code blocks. This is a planning prompt, not an implementation.`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    const buildPrompt = (message.content[0] as { type: string; text: string }).text?.trim() ?? "";

    // Persist on the feature
    await prisma.feature.update({ where: { id: featureId }, data: { buildPrompt } });

    return NextResponse.json({ buildPrompt });
  } catch {
    return NextResponse.json({ error: "Failed to generate prompt" }, { status: 500 });
  }
}
