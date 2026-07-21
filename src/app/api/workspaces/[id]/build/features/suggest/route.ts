import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import type { WorkspaceSynthesis } from "@/lib/analysis/workspaceSynthesis";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type Params = Promise<{ id: string }>;

export interface FeatureSuggestion {
  title: string;
  description: string;
  category: "core" | "nice-to-have" | "future";
  sourceGap: string;
}

export async function POST(_req: Request, { params }: { params: Params }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: workspaceId } = await params;

  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId: session.user.id },
    select: {
      name: true,
      findings: true,
      buildPlan: { select: { id: true, idea: true, targetUser: true, coreValue: true } },
    },
  });
  if (!workspace?.buildPlan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let synthesis: WorkspaceSynthesis | null = null;
  if (workspace.findings) {
    try { synthesis = JSON.parse(workspace.findings) as WorkspaceSynthesis; } catch {}
  }

  const gaps = synthesis?.featureGaps ?? [];
  const painPoints = synthesis?.painPoints ?? [];

  const context = [
    `App idea: ${workspace.buildPlan.idea ?? "unknown"}`,
    `Target user: ${workspace.buildPlan.targetUser ?? "unknown"}`,
    `Core value: ${workspace.buildPlan.coreValue ?? "unknown"}`,
    gaps.length > 0
      ? `Market gaps:\n${gaps.map((g, i) => `  ${i + 1}. "${g.title}" — ${g.opportunity}`).join("\n")}`
      : "",
    painPoints.length > 0
      ? `Top pain points:\n${painPoints.slice(0, 5).map((p, i) => `  ${i + 1}. [${p.severity}] "${p.title}"`).join("\n")}`
      : "",
  ].filter(Boolean).join("\n\n");

  const prompt = `You are a product planning assistant for the app described below. Suggest 5-8 concrete features that would make this app successful, grounded in the real market gaps and pain points provided.

${context}

Return JSON only (no fences):
[
  {
    "title": "Short feature name",
    "description": "What it does in 1-2 sentences",
    "category": "core" | "nice-to-have" | "future",
    "sourceGap": "The specific gap or pain point this addresses (quote the real finding, or empty string if not from research)"
  }
]

Rules:
- core: MVP features that directly deliver the core value
- nice-to-have: improves the experience but not essential for v1
- future: good ideas for later versions
- At least 3 core features, max 8 total
- sourceGap must cite real findings when possible — this is what makes suggestions trustworthy
- JSON array only, no other text`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = (message.content[0] as { type: string; text: string }).text ?? "";
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

    let suggestions: FeatureSuggestion[] = [];
    try { suggestions = JSON.parse(cleaned) as FeatureSuggestion[]; } catch {}
    if (!Array.isArray(suggestions)) suggestions = [];

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 });
  }
}
