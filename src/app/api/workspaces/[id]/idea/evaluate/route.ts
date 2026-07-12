import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { canEvaluateIdea } from "@/lib/entitlements";

const client = new Anthropic();

export interface GapFilled {
  gap: string;
  matched: boolean;
}

export interface PainSolved {
  pain: string;
  signal_strength: 1 | 2 | 3 | 4;
}

export interface Overlap {
  competitor: string;
  reason: string;
}

export interface IdeaEvaluation {
  verdict: "strong" | "partial" | "crowded";
  summary: string;
  gaps_filled: GapFilled[];
  pains_solved: PainSolved[];
  overlaps: Overlap[];
  pricing_position: string;
  reasoning: string;
}

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const billingUser = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { subscriptionTier: true, subscriptionStatus: true, trialEndsAt: true },
  });
  const gate = canEvaluateIdea(billingUser);
  if (!gate.allowed) {
    return NextResponse.json({ error: "upgrade_required", gate: gate.gate }, { status: 402 });
  }

  const { id } = await params;
  const ws = await prisma.workspace.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, name: true, findings: true },
  });
  if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const idea = await prisma.ideaNode.findFirst({ where: { workspaceId: id } });
  if (!idea || !idea.text.trim())
    return NextResponse.json({ error: "No idea to evaluate" }, { status: 400 });

  // Gather competitor summaries (complete nodes only)
  const nodes = await prisma.node.findMany({
    where: { workspaceId: id, status: "complete", report: { not: null } },
    select: { name: true, report: true },
  });

  if (nodes.length < 3)
    return NextResponse.json(
      { error: "Need at least 3 analyzed competitors" },
      { status: 400 },
    );

  // Build competitor context
  const competitorNames: string[] = [];
  const competitorContext = nodes
    .map((n) => {
      const name = n.name ?? "Unknown App";
      competitorNames.push(name);
      try {
        const r = JSON.parse(n.report!) as {
          pricingModel?: string;
          rating?: number;
          painPoints?: { title: string; severity: string }[];
        };
        const pains = (r.painPoints ?? [])
          .slice(0, 3)
          .map((p) => `  - [${p.severity}] ${p.title}`)
          .join("\n");
        return `## ${name}\nPricing: ${r.pricingModel ?? "Unknown"} | Rating: ${r.rating ?? "—"}\nTop pains:\n${pains || "  (none)"}`;
      } catch {
        return `## ${name}\n(no report data)`;
      }
    })
    .join("\n\n");

  // Parse findings for gaps and pains
  let gapTitles: string[] = [];
  let painTitles: string[] = [];
  let findingsContext = "";

  if (ws.findings) {
    try {
      const f = JSON.parse(ws.findings) as {
        painPoints?: { title: string }[];
        featureGaps?: { title: string; opportunity?: string }[];
        marketEntry?: { wedge?: string };
      };
      painTitles = (f.painPoints ?? []).map((p) => p.title);
      gapTitles = (f.featureGaps ?? []).map((g) => g.title);

      const painsStr = painTitles.map((p) => `- ${p}`).join("\n");
      const gapsStr = (f.featureGaps ?? [])
        .map((g) => `- ${g.title}${g.opportunity ? `: ${g.opportunity}` : ""}`)
        .join("\n");

      findingsContext = `\n\n# Synthesized Market Findings\n## Shared Pain Points\n${painsStr || "(none found)"}\n\n## Feature Gaps\n${gapsStr || "(none found)"}`;
      if (f.marketEntry?.wedge) {
        findingsContext += `\n\n## Suggested Market Entry\n${f.marketEntry.wedge}`;
      }
    } catch {}
  }

  const ideaSummary = [
    `Idea: ${idea.text}`,
    idea.targetUser ? `Target user: ${idea.targetUser}` : null,
    idea.keyFeature ? `Key differentiator: ${idea.keyFeature}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = `You are an honest market analyst for startup founders. Evaluate this product idea against real competitor data. Be HONEST — if the market is crowded or the idea overlaps heavily with existing products, say so. Do NOT validate ideas just to be encouraging. A "crowded" verdict is useful and valuable to founders; false hope is not.

# Competitors in this market
${competitorContext}
${findingsContext}

# Founder's Idea
${ideaSummary}

Return ONLY valid JSON matching this exact schema — no markdown fences, no text outside the JSON:

{
  "verdict": "strong" | "partial" | "crowded",
  "summary": "One sentence: e.g. 'Solves 2 of 3 shared pains but overlaps heavily with TurboAI and Superwhisper'",
  "gaps_filled": [
    { "gap": "<exact gap title from findings>", "matched": true }
  ],
  "pains_solved": [
    { "pain": "<exact pain title from findings>", "signal_strength": 1 }
  ],
  "overlaps": [
    { "competitor": "<exact app name from competitor list>", "reason": "<brief specific reason>" }
  ],
  "pricing_position": "One sentence on where this sits price-wise vs. market",
  "reasoning": "2-3 paragraphs: honest analysis explaining the verdict with specific evidence from competitor data"
}

Rules:
- Include ALL ${gapTitles.length} gap titles from findings in gaps_filled — mark matched=true only if the idea directly addresses that gap
- Include only pains the idea genuinely addresses in pains_solved (can be empty)
- signal_strength: 1=low demand, 2=moderate, 3=high, 4=critical unmet need
- Use EXACT competitor names: ${competitorNames.join(", ")}
- Verdict guide:
  "strong": clear unaddressed gap, solves documented pains, minimal direct overlap
  "partial": addresses real pains but overlaps meaningfully with 1-2 competitors
  "crowded": directly replicates what multiple competitors already do well`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    // Strip markdown fences if present
    const cleaned = raw.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?\s*```$/, "").trim();

    let evaluation: IdeaEvaluation;
    try {
      evaluation = JSON.parse(cleaned) as IdeaEvaluation;
    } catch {
      // Attempt to extract JSON from response
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON found in response");
      evaluation = JSON.parse(match[0]) as IdeaEvaluation;
    }

    if (!["strong", "partial", "crowded"].includes(evaluation.verdict)) {
      throw new Error("Invalid verdict value");
    }

    // Ensure arrays are present
    evaluation.gaps_filled = evaluation.gaps_filled ?? [];
    evaluation.pains_solved = evaluation.pains_solved ?? [];
    evaluation.overlaps = evaluation.overlaps ?? [];

    // Persist to DB
    await prisma.ideaNode.update({
      where: { id: idea.id },
      data: {
        verdict: evaluation.verdict,
        evaluationJson: JSON.stringify(evaluation),
        lastEvaluatedAt: new Date(),
      },
    });

    return NextResponse.json(evaluation);
  } catch (err) {
    console.error("[idea/evaluate]", err);
    return NextResponse.json({ error: "Evaluation failed" }, { status: 500 });
  }
}
