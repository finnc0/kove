import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { isPro } from "@/lib/entitlements";
import { captureError } from "@/lib/sentry";

const client = new Anthropic();

export interface IdeaEvaluation {
  verdict: "strong" | "partial" | "crowded";
  summary: string;
  gaps_filled: string[];
  pains_solved: string[];
  overlaps: string[];
  pricing_position: string;
  reasoning: string;
}

type Params = { params: Promise<{ id: string; ideaId: string }> };

export async function POST(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, ideaId } = await params;

  const billingUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscriptionTier: true, subscriptionStatus: true, trialEndsAt: true },
  });
  if (!isPro(billingUser ?? { subscriptionTier: "explorer", subscriptionStatus: "free", trialEndsAt: null }))
    return NextResponse.json({ error: "upgrade_required", gate: "idea_evaluation" }, { status: 403 });

  const ws = await prisma.workspace.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, name: true, findings: true },
  });
  if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const idea = await prisma.ideaNode.findFirst({
    where: { id: ideaId, workspaceId: id },
  });
  if (!idea || !idea.text.trim())
    return NextResponse.json({ error: "No idea to evaluate" }, { status: 400 });

  const nodes = await prisma.node.findMany({
    where: { workspaceId: id, status: "complete", report: { not: null } },
    select: { name: true, report: true },
  });

  if (nodes.length < 3)
    return NextResponse.json(
      { error: "Need at least 3 analyzed competitors" },
      { status: 400 },
    );

  const competitorContext = nodes
    .map((n) => {
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
        return `## ${n.name ?? "App"}\nPricing: ${r.pricingModel ?? "Unknown"} | Rating: ${r.rating ?? "—"}\nTop pain points:\n${pains || "  (none)"}`;
      } catch {
        return `## ${n.name ?? "App"}\n(no report data)`;
      }
    })
    .join("\n\n");

  let findingsContext = "";
  if (ws.findings) {
    try {
      const f = JSON.parse(ws.findings) as {
        painPoints?: { title: string }[];
        featureGaps?: { title: string; opportunity: string }[];
        marketEntry?: { wedge?: string; differentiator?: string };
      };
      const pains = (f.painPoints ?? []).map((p) => `- ${p.title}`).join("\n");
      const gaps = (f.featureGaps ?? [])
        .map((g) => `- ${g.title}: ${g.opportunity}`)
        .join("\n");
      findingsContext = `\n\n# Synthesized Market Findings\n## Shared Pain Points\n${pains}\n\n## Feature Gaps\n${gaps}`;
      if (f.marketEntry?.wedge) {
        findingsContext += `\n\n## Suggested Market Entry\n${f.marketEntry.wedge}`;
      }
    } catch {}
  }

  const ideaSummary = [
    `Idea: ${idea.text}`,
    idea.targetUser ? `Target user: ${idea.targetUser}` : "",
    idea.keyFeature ? `Key feature: ${idea.keyFeature}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = `You are an honest market analyst for startup founders. Your job is to evaluate a founder's product idea against real competitor data. Be HONEST — if the market is crowded or the idea overlaps heavily with existing products, say so. Do NOT validate ideas just to be encouraging. A "crowded" verdict is useful; false hope is not.

# Competitors in this market
${competitorContext}
${findingsContext}

# Founder's Idea
${ideaSummary}

Evaluate this idea against the competitor landscape. Return ONLY valid JSON matching this exact schema — no markdown, no explanation outside the JSON:

{
  "verdict": "strong" | "partial" | "crowded",
  "summary": "2–3 sentence honest summary of how the idea fits",
  "gaps_filled": ["specific gap this idea fills"],
  "pains_solved": ["specific user pain this idea addresses"],
  "overlaps": ["competitor features that already do this"],
  "pricing_position": "where this sits vs the market (e.g. premium, undercut, same tier)",
  "reasoning": "3–5 sentences explaining the verdict with specific evidence from the competitor data"
}

Verdict guide:
- "strong": clear gap, solves documented pains, minimal direct overlap
- "partial": addresses some real pains but overlaps meaningfully with 1–2 competitors
- "crowded": directly replicates what multiple competitors already do well`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const raw =
      message.content[0].type === "text" ? message.content[0].text : "";

    const cleaned = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    const evaluation = JSON.parse(cleaned) as IdeaEvaluation;

    if (!["strong", "partial", "crowded"].includes(evaluation.verdict)) {
      throw new Error("Invalid verdict");
    }

    await prisma.ideaNode.update({
      where: { id: ideaId },
      data: {
        verdict: evaluation.verdict,
        evaluationJson: JSON.stringify(evaluation),
        lastEvaluatedAt: new Date(),
      },
    });

    return NextResponse.json(evaluation);
  } catch (err) {
    captureError(err, "ai.idea_evaluate", { ideaId, workspaceId: id });
    console.error("[idea/evaluate]", err);
    return NextResponse.json({ error: "Evaluation failed" }, { status: 500 });
  }
}
