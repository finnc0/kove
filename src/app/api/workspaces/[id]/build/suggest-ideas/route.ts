import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import type { WorkspaceSynthesis } from "@/lib/analysis/workspaceSynthesis";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type Params = Promise<{ id: string }>;

export interface IdeaSuggestion {
  concept: string;
  solvesGap: string;
  why: string;
}

export async function POST(_req: Request, { params }: { params: Params }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: workspaceId } = await params;

  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId: session.user.id },
    select: { id: true, name: true, findings: true },
  });

  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Parse existing workspace synthesis (gaps + pain points)
  let synthesis: WorkspaceSynthesis | null = null;
  if (workspace.findings) {
    try {
      synthesis = JSON.parse(workspace.findings) as WorkspaceSynthesis;
    } catch {}
  }

  const gaps = synthesis?.featureGaps ?? [];
  const painPoints = synthesis?.painPoints ?? [];

  // Build grounded context — only real research
  const gapContext =
    gaps.length > 0
      ? gaps
          .map(
            (g, i) =>
              `Gap ${i + 1}: "${g.title}" — ${g.description}. Opportunity: ${g.opportunity}`,
          )
          .join("\n")
      : null;

  const painContext =
    painPoints.length > 0
      ? painPoints
          .slice(0, 5)
          .map((p, i) => `Pain ${i + 1}: [${p.severity}] "${p.title}" — ${p.description}`)
          .join("\n")
      : null;

  if (!gapContext && !painContext) {
    return NextResponse.json({
      ideas: [],
      noData: true,
    });
  }

  const prompt = `You are helping a startup founder who just researched the "${workspace.name}" app market using Kove.

Based ONLY on the real unsolved gaps and pain points found in this market, generate 3-4 concrete app ideas. Each idea must be directly traceable to a specific gap or pain point below — no generic ideas.

${gapContext ? `UNSOLVED GAPS:\n${gapContext}` : ""}
${painContext ? `\nTOP PAIN POINTS:\n${painContext}` : ""}

Return JSON only, no markdown fences, no explanation:
[
  {
    "concept": "Short app concept (1 sentence, starts with a noun)",
    "solvesGap": "The specific gap or pain point this solves (quote the real finding)",
    "why": "One sentence on why this is a real opportunity given the research"
  }
]

Rules:
- concept: short, concrete, no buzzwords — what the app literally does
- solvesGap: cite the actual finding from above, be specific
- why: grounded in the research data, not generic market claims
- 3 to 4 ideas only
- JSON array only, no other text`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = (message.content[0] as { type: string; text: string }).text ?? "";

    // Safe JSON parse — strip any accidental fences
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    let ideas: IdeaSuggestion[] = [];
    try {
      ideas = JSON.parse(cleaned) as IdeaSuggestion[];
      if (!Array.isArray(ideas)) ideas = [];
    } catch {
      ideas = [];
    }

    return NextResponse.json({ ideas });
  } catch {
    return NextResponse.json({ error: "Failed to generate ideas" }, { status: 500 });
  }
}
