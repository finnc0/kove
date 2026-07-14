import Anthropic from "@anthropic-ai/sdk";
import type { NodeReport } from "@/app/(app)/workspace/[id]/mockData";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface SynthesisPainPoint {
  title: string;
  description: string;
  severity: "Critical" | "High" | "Medium";
}

export interface SynthesisSignal {
  title: string;
  description: string;
}

export interface SynthesisGap {
  title: string;
  description: string;
  opportunity: string;
}

export interface WorkspaceSynthesis {
  generatedAt: string;
  appCount: number;
  nicheOverview: string;
  painPoints: SynthesisPainPoint[];
  positiveSignals: SynthesisSignal[];
  featureGaps: SynthesisGap[];
  marketEntry: {
    wedge: string;
    icp: string;
    differentiator: string;
    featureBets: string[];
    pitfalls: string[];
  };
}

interface AppSummary {
  name: string;
  rating: number;
  reviewCount: number;
  category: string;
  pricingModel: string;
  description: string;
  painPoints: { title: string; severity: string; reviewCount?: number; quote: string }[];
  positiveSignals: { theme: string; frequency: string; quote: string }[];
  aiSynthesis: { doesWell: string; fails: string; implication: string };
}

const SCHEMA = `{
  "nicheOverview": "2 sentences. What is this market, who uses it, and what is the defining structural tension (e.g. crowded but low quality, niche but underserved). No individual app names.",

  "painPoints": [
    {
      "title": "5–9 word behavioral title — what users across this niche LOSE or CANNOT DO. Not the technical failure, not the generic complaint.",
      "description": "2 sentences. (1) State the cross-app pattern with specific evidence: how many apps show this, what users actually say or do. (2) Why existing apps haven't fixed it — structural reason, not just 'they haven't tried'. No app names.",
      "severity": "Critical | High | Medium",
      "appsAffected": 0
    }
  ],

  "positiveSignals": [
    {
      "title": "4–7 word title naming what works across the niche",
      "description": "1 sentence. The thing users genuinely value — the retention anchor. Must appear in reviews of 2+ apps."
    }
  ],

  "featureGaps": [
    {
      "title": "5–9 words. Name the missing capability in plain English — what users want to do but can't. No jargon.",
      "description": "2 short sentences. (1) What users are doing instead — the workaround or repeated ask from the review data. (2) Why none of the existing apps have built it — a real structural reason, not 'they haven't tried'.",
      "opportunity": "1 short sentence starting with an action verb. A specific software capability a developer could scope and ship — substantial enough to meaningfully change the user's workflow. HARD REJECTS for opportunity: transparent pricing, upfront pricing, honest refunds, better support, clearer onboarding, price disclosure, honest marketing, lower price, more content, faster support — these are business decisions, not product capabilities. If a competitor could copy it without writing code, it is not an opportunity. The opportunity must describe something that takes weeks to engineer and, once built, meaningfully changes what users can accomplish. Example: 'Build offline-first note sync that survives background kills without losing data.'"
    }
  ],

  "marketEntry": {
    "wedge": "1 punchy sentence. The exact PRODUCT CAPABILITY that exploits the biggest structural gap — something that requires engineering to build, not a business or policy change. If the wedge could be described as 'just be more transparent / honest / upfront / cheaper / friendlier', it is not a wedge. It must name what users will be able to DO that they cannot do today.",
    "icp": "1 sentence. Who the highest-pain first customer is — describe their workflow and the specific moment they hit the wall, not just their demographic.",
    "differentiator": "1–2 sentences. The core product architecture or workflow that separates a new entrant — a structural bet that competitors cannot copy without rebuilding. Not a feature list, not a brand promise, not a policy.",
    "featureBets": ["specific software capability to build first — describe the user action it unlocks, under 15 words"],
    "pitfalls": ["specific product or strategic mistake to avoid from the review patterns, under 15 words"]
  }
}`;

function buildMessages(apps: AppSummary[]) {
  const appBlock = apps.map((a) => `
APP: ${a.name} · ${a.rating}/5 · ${a.reviewCount.toLocaleString()} reviews · ${a.pricingModel}
${a.description}

Pain points extracted from negative reviews (each grounded in actual review text):
${a.painPoints.map((p) => `  [${p.severity}${p.reviewCount ? ` · ${p.reviewCount} reviews` : ""}] ${p.title}: "${p.quote}"`).join("\n")}

What users praise (positive signals):
${a.positiveSignals.map((s) => `  ${s.theme} (${s.frequency}): "${s.quote}"`).join("\n")}

AI analysis:
  Does well: ${a.aiSynthesis.doesWell}
  Structural failures: ${a.aiSynthesis.fails}
  Competitive implication: ${a.aiSynthesis.implication}
`.trim()).join("\n\n---\n\n");

  const system = `You are a market analyst writing a competitive intelligence brief for a startup founder. Be direct, opinionated, and evidence-driven — founders need clear calls grounded in data, not generic summaries.

HARD RULES:
- Write about the NICHE as a whole — never name individual apps in painPoints, positiveSignals, or featureGaps
- Every claim must be traceable to the provided review data. If you can't point to a specific pattern in the data, don't say it.
- painPoints: only include patterns that appear in the review data of 2 or more apps. A pain point in only one app is that app's problem, not the niche's. Set "appsAffected" to the actual count.
- featureGaps: each gap must be a specific software capability that a small team could actually build and ship. Derive it from: (a) a workaround users describe, (b) a feature explicitly requested across multiple reviews, or (c) a behavioral pattern showing unmet need.
  REJECT these — they are not gaps: "better performance", "simpler onboarding", "dark mode", "more integrations", "faster sync", "better customer support", "lower prices", "more content", "better design", "transparent pricing", "upfront pricing", "honest refunds", "price before paywall", "better communication", "faster responses", "clearer UI", "honest marketing". The bar: if a competitor could close this gap by updating a policy document, hiring a support rep, or changing a price — it is NOT a gap. A gap must require writing significant new code that changes what users can DO.
  A gap is substantial when: it removes a repeated behavioral friction (users describe workarounds), it unlocks a workflow users currently cannot complete in any existing app, or it addresses a structural design flaw that all current apps share for architectural reasons.
  ACCEPT only gaps where you can point to a specific thing users try to do and cannot.
- Titles must be plain English. Write like you're explaining to a non-technical friend what users can't do.
  ✓ "can't keep notes in sync across two phones" — clear, specific
  ✗ "cross-device synchronization reliability" — jargon, vague
- The opportunity sentence must start with an action verb and name what to build. Not "there is an opportunity to..." — just say what to build.
  ✓ "Build a shared task list that works without both people having an account."
  ✗ "There is an opportunity to capture users who need collaboration features."
- Output 4–7 painPoints, 2–3 featureGaps. Fewer strong ones beat more weak ones.
- Return ONLY valid JSON. No prose, no markdown fences.`;

  const userContent = `Here are ${apps.length} iOS apps from the same niche. Your job: identify the patterns that appear across multiple apps' review data and give a founder a precise market entry angle.

For painPoints: scan each app's pain points and find the ones that recur across apps. Weight by severity and frequency. Only report cross-app patterns.
For featureGaps: look for: (1) workarounds users describe in reviews, (2) requests that appear across multiple apps, (3) complaints where users switch apps and find the same problem everywhere. Each gap must be something that requires engineering to fix — a specific software capability that changes what users can DO. Hard filter: if a competitor could close the gap by changing a pricing page, updating their support SLA, or writing a blog post about transparency, it is NOT a gap — discard it entirely. Write the opportunity as a single action sentence telling a founder exactly what to build, specific enough that an engineer could scope it. The opportunity must be substantial: it either removes a repeated friction that all current apps share for structural reasons, or it unlocks a workflow users currently cannot complete in any existing app.

${appBlock}

Return JSON exactly matching this schema:
${SCHEMA}`;

  return { system, userContent };
}

function parseResult(raw: string, apps: AppSummary[]): WorkspaceSynthesis {
  let s = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const start = s.indexOf("{"); const end = s.lastIndexOf("}");
  if (start !== -1 && end > start) s = s.slice(start, end + 1);
  const parsed = JSON.parse(s);
  return { generatedAt: new Date().toISOString(), appCount: apps.length, ...parsed };
}

export async function synthesizeWorkspace(apps: AppSummary[]): Promise<WorkspaceSynthesis> {
  const { system, userContent } = buildMessages(apps);
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    system,
    messages: [{ role: "user", content: userContent }],
  });
  const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "";
  return parseResult(raw, apps);
}

// Streaming version — calls onProgress(pct) as Claude tokens arrive (pct range: 15–90)
export async function synthesizeWorkspaceStreaming(
  apps: AppSummary[],
  onProgress: (pct: number) => void,
): Promise<WorkspaceSynthesis> {
  const { system, userContent } = buildMessages(apps);
  const EXPECTED_CHARS = 3000; // typical synthesis output size

  // Use create with stream:true for reliable raw token streaming
  const stream = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    stream: true,
    system,
    messages: [{ role: "user", content: userContent }],
  });

  let accumulated = "";
  let lastReportedPct = 14;

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      accumulated += event.delta.text;
      const pct = 15 + Math.min(75, Math.round((accumulated.length / EXPECTED_CHARS) * 75));
      // Only emit when pct advances by ≥2 to avoid flooding the SSE channel
      if (pct >= lastReportedPct + 2) {
        lastReportedPct = pct;
        onProgress(pct);
      }
    }
  }

  return parseResult(accumulated, apps);
}

export function buildAppSummaries(
  nodes: { name: string | null; report: string | null }[],
): AppSummary[] {
  const summaries: AppSummary[] = [];
  for (const node of nodes) {
    if (!node.report) continue;
    let report: NodeReport;
    try { report = JSON.parse(node.report); } catch { continue; }
    summaries.push({
      name: node.name ?? report.appName,
      rating: report.rating,
      reviewCount: report.reviewCount,
      category: report.category,
      pricingModel: report.pricingModel,
      description: report.description,
      painPoints: (report.painPoints ?? []).map((p) => ({
        title: p.title,
        severity: p.severity,
        reviewCount: (p as { reviewCount?: number }).reviewCount,
        quote: p.quote,
      })),
      positiveSignals: report.positiveSignals ?? [],
      aiSynthesis: report.aiSynthesis ?? { doesWell: "", fails: "", implication: "" },
    });
  }
  return summaries;
}
