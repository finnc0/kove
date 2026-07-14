import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisReport, ReportMode } from "./reportSchema";
import type { IOSRawData } from "./analysis/ios";
import type { NodeReport } from "@/app/(app)/workspace/[id]/mockData";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface SynthesisInput {
  mode: ReportMode;
  category: string;
  audience: string;
  angle: string;
  focusArea: string;
  appStoreApps: string;
  playStoreApps: string;
  appStoreReviews: string;
  playStoreReviews: string;
  redditPosts: string;
  websiteContent: string;
  pricingContent: string;
}

const SYSTEM_PROMPT = `You are a market intelligence analyst. Your output goes directly into a product used by startup founders. Be direct, specific, and brief — every sentence must earn its place. No hedging, no padding, no essay introductions.

DATA RULES:
- Use only what is explicitly in the provided data. Do not infer or fill gaps with general knowledge.
- Competitor names, ratings, and review counts must be verbatim from the data.
- Pain points need grounding in actual review text or Reddit quotes — paraphrase tightly, don't invent.
- Pricing: use the COMPETITOR PRICING PAGES section first (scraped directly); fall back to IAP, descriptions, or reviews only when absent. Extract every tier. Do not invent prices.
- If a section is empty, note it — do not fabricate.

OUTPUT RULES:
- Be opinionated. Founders need clear calls, not both-sides summaries.
- Return ONLY valid JSON — no prose, no markdown, no code fences.`;

const REPORT_SCHEMA = `{
  "title": "string — the market or app name being researched",
  "marketSnapshot": {
    "competitorsFound": number,
    "avgRating": number (1–5, one decimal),
    "topPlatform": "iOS | Android | Web",
    "marketSignal": "Growing | Stable | Declining",
    "summary": "2 sentences. Lead with the most important number or signal, then the key structural tension in this market."
  },
  "competitors": [
    {
      "name": "string",
      "platforms": ["iOS", "Android", "Web"] (only platforms where they actually exist),
      "rating": number (1–5),
      "reviews": number (actual review count),
      "pricing": "e.g. Freemium · from $X/mo or Free or Paid only · $X/mo",
      "description": "1 sentence on their core positioning and who they serve",
      "strengths": ["string", "string", "string"] (3 items, each under 10 words),
      "weaknesses": ["string", "string", "string"] (3 items, each under 10 words),
      "url": "domain only, e.g. notion.so"
    }
  ],
  "painPoints": [
    {
      "rank": number (1 = most severe),
      "title": "short title under 8 words",
      "severity": "High | Medium | Low",
      "sources": ["App Store", "Google Play", "Reddit"] (only sources where this actually appears),
      "detail": "1–2 sentences. State the problem and one concrete piece of evidence from the data."
    }
  ] (5–8 items),
  "gaps": [
    {
      "title": "short gap title under 8 words",
      "evidence": "1–2 sentences. What do users want that nobody provides? Ground it in a specific complaint or workaround from the data.",
      "relatedPainPoints": ["exact pain point title"],
      "opportunityId": "slug matching an opportunity id below"
    }
  ] (3–5 items),
  "opportunities": [
    {
      "id": "slug",
      "title": "short opportunity title",
      "marketSize": number 1–5 (5 = huge addressable market),
      "buildEffort": number 1–5 (5 = very hard to build, 1 = quick to ship),
      "moat": number 1–5 (5 = very defensible)
    }
  ] (one per gap),
  "pricing": {
    "competitorPricing": [
      {
        "name": "string — exact app name matching a competitor above",
        "model": "Freemium | Subscription | One-time | Free",
        "hasFree": boolean,
        "startingPrice": number (0 if fully free, otherwise lowest monthly paid price),
        "period": "month | year | lifetime | free",
        "tiers": [
          {
            "name": "string — tier name e.g. Free, Basic, Starter, Pro, Premium, Business, Enterprise",
            "price": number (monthly equivalent; 0 for free tier),
            "period": "month | year | lifetime | free | one-time",
            "isPopular": boolean (true for the tier highlighted as 'most popular')
          }
        ] (extract ALL tiers from app description, reviews, or IAP data; minimum 1 tier)
      }
    ],
    "modelBreakdown": [
      { "model": "string", "count": number, "percentage": number }
    ],
    "avgPaidPrice": number (mean of non-zero startingPrice values),
    "priceRange": { "min": number, "max": number },
    "summary": "1–2 sentences on pricing dynamics and the most notable gap or pattern.",
    "recommendation": {
      "model": "recommended model for a new entrant",
      "price": "specific recommendation e.g. $9/mo · $79/yr",
      "rationale": "1–2 sentences justifying the price point from the competitive data.",
      "considerations": ["string", "string", "string"] (3 tactical pricing tips, each under 15 words)
    }
  },
  "positioning": {
    "intro": "1–2 sentences on where the market opening is.",
    "subsections": [
      { "heading": "Recommended ICP", "body": "1–2 sentences. Who feels the pain most acutely and why existing tools fail them." },
      { "heading": "Wedge positioning", "body": "1–2 sentences. The specific angle that exploits the biggest gap." },
      { "heading": "Differentiation from incumbents", "body": "1–2 sentences. What you do fundamentally differently, not just a feature list." }
    ],
    "wedge": "1 punchy sentence. A positioning statement specific enough to be a product tagline."
  }
}`;

export async function synthesizeReport(input: SynthesisInput): Promise<AnalysisReport> {
  const userMessage = `Analyze the following scraped market data and generate a structured report for a startup founder. All insights must be derived solely from the data below — do not add external knowledge.

MODE: ${input.mode}
MARKET / CATEGORY: ${input.category || "not specified"}
TARGET AUDIENCE: ${input.audience || "not specified"}
FOUNDER'S ANGLE: ${input.angle || "not specified"}
FOCUS AREA: ${input.focusArea || "not specified"}

=== APP STORE DATA (iOS) ===
Each app entry includes name, developer, rating, review count, price, genre, star distribution histogram, and description.
${input.appStoreApps || "No App Store data available."}

=== APP STORE REVIEWS (iOS) ===
Reviews are labeled by sort type (Recent / Most Helpful). Use low-star reviews to identify pain points.
${input.appStoreReviews || "No App Store reviews available."}

=== GOOGLE PLAY DATA (Android) ===
Each app entry includes name, developer, rating, review count, price, genre, star distribution histogram, and description.
${input.playStoreApps || "No Google Play data available."}

=== GOOGLE PLAY REVIEWS (Android) ===
Reviews sorted by helpfulness and by rating (lowest first). Use low-rating reviews to identify pain points.
${input.playStoreReviews || "No Google Play reviews available."}

=== REDDIT DISCUSSIONS ===
Posts include subreddit, score, comment count, post body, and top comments where available.
${input.redditPosts || "No Reddit data available."}

=== COMPETITOR PRICING PAGES (scraped directly from their websites) ===
This is the most authoritative source for pricing tiers. Prefer this over descriptions or reviews.
${input.pricingContent || "No pricing page data available."}

=== WEBSITE CONTENT (user-provided URLs) ===
${input.websiteContent || "No website content available."}

Return the report as JSON matching this exact schema:
${REPORT_SCHEMA}`;

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 8192,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        // Prompt caching — system prompt is identical across requests
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userMessage }],
  });

  const raw = response.content[0].type === "text" ? response.content[0].text : "";
  const parsed = JSON.parse(extractJson(raw));

  // Attach metadata not produced by Claude
  return {
    ...parsed,
    id: "",           // caller sets this
    mode: input.mode,
    project: "",      // caller sets this
    generatedAt: new Date().toISOString(),
  };
}

// ─── Per-node iOS analysis ────────────────────────────────────────────────────

function buildNodePrompt(rawData: IOSRawData): string {
  const { iTunes, reviews, charts, iap, appStorePageMarkdown, developerSite, reddit } = rawData;

  const neg = reviews.negative.slice(0, 30).map(r =>
    `[${r.rating}★ v${r.version}] ${r.title}: ${r.body.slice(0, 300)}`
  ).join("\n");

  const pos = reviews.positive.slice(0, 20).map(r =>
    `[${r.rating}★ v${r.version}] ${r.title}: ${r.body.slice(0, 250)}`
  ).join("\n");

  const chartLines = [
    charts.topFreeRank != null ? `Top Free Apps: #${charts.topFreeRank}` : null,
    charts.topPaidRank != null ? `Top Paid Apps: #${charts.topPaidRank}` : null,
    charts.topGrossingRank != null ? `Top Grossing: #${charts.topGrossingRank}` : null,
    charts.categoryFreeRank != null ? `Category Free: #${charts.categoryFreeRank}` : null,
  ].filter(Boolean).join(" | ") || "Not in top 200 charts";

  const iapLines = iap.length
    ? iap.map(i => `• ${i.name}: ${i.formattedPrice || `$${i.price}`}`).join("\n")
    : "No in-app purchases listed";

  const redditLines = reddit.length
    ? reddit.map(p => `[r/${p.subreddit} · ${p.score}pts] "${p.title}"\n${p.body.slice(0, 200)}`).join("\n\n")
    : "No Reddit posts found";

  return `You are a product analyst. Analyze the iOS app data below and return a JSON report. Be direct and brief — every field should be the minimum words needed to convey the fact.

RULES:
- Use only data from the sections below. Do not fabricate.
- Where a field has no data, use "N/A" or an empty array.
- Quotes must be near-verbatim from actual reviews in Section 4 — never paraphrase, never invent.
- Pricing: output pricingTiers ONLY from explicit data in Section 3 (scraped IAP) or Section 7 (developer pricing page). Section 3 is the primary source — copy it verbatim. If both are empty, output pricingTiers: []. NEVER infer, estimate, or guess prices. If you cannot find a real price with a real tier name in Section 3 or Section 7, omit the tier entirely.

PAIN POINTS — strict evidence rules:
- Include only patterns that appear in 3 or more of the provided negative reviews. If you can't cite 3, don't include it.
- Title must be behavioral: describe what the user LOSES or CANNOT DO. Not the technical failure.
  ✓ Good: "notes disappear after background refresh", "can't edit shared docs offline"
  ✗ Bad: "sync issues", "offline mode needed", "app crashes", "slow performance"
- Reject any pain point that is generic — one that could be said of any app without reading these reviews. If you could have written it without reading Section 4, throw it out.
- Quote must be 15–30 words taken near-verbatim from Section 4. Copy the user's own words.
- Severity: High = users cite this as their reason to uninstall or switch; Medium = recurring frustration but they stay; Low = minor annoyance mentioned occasionally.
- Output 3–7 pain points. Fewer strong ones beat more weak ones.

═══════════════════════════════════════
SECTION 1 — iTunes API Metadata
═══════════════════════════════════════
App Name: ${iTunes.name}
Developer: ${iTunes.developerName}
Category: ${iTunes.category}
Price: ${iTunes.price === 0 ? "Free" : `$${iTunes.price}`}
Rating: ${iTunes.rating.toFixed(2)} / 5
Total Ratings: ${iTunes.ratingCount.toLocaleString()}
Current Version Rating: ${iTunes.ratingCurrentVersion.toFixed(2)} (${iTunes.ratingCountCurrentVersion.toLocaleString()} ratings)
Version: ${iTunes.version}
Min iOS: ${iTunes.minimumOsVersion}
Last Updated: ${iTunes.lastUpdated}
Release Date: ${iTunes.releaseDate}
Languages: ${iTunes.languages.slice(0, 10).join(", ")}
Content Rating: ${iTunes.contentRating}
File Size: ${Math.round(Number(iTunes.fileSize) / 1_000_000)}MB
Developer URL: ${iTunes.sellerUrl || "None"}
Description:
${iTunes.description}

═══════════════════════════════════════
SECTION 2 — Chart Positions (Apple RSS)
═══════════════════════════════════════
${chartLines}

═══════════════════════════════════════
SECTION 3 — In-App Purchases (scraped from App Store page)
═══════════════════════════════════════
${iapLines}
Note: These are the real prices scraped directly from the App Store page. Use them as-is for pricingTiers. If this section says "No in-app purchases listed", fall back to Section 7 (developer pricing page). Do NOT invent prices.

═══════════════════════════════════════
SECTION 4 — Negative Reviews (top ${reviews.negative.slice(0, 30).length} by helpfulness)
═══════════════════════════════════════
${neg || "No negative reviews available"}

═══════════════════════════════════════
SECTION 5 — Positive Reviews (top ${reviews.positive.slice(0, 20).length} by helpfulness)
═══════════════════════════════════════
${pos || "No positive reviews available"}

═══════════════════════════════════════
SECTION 6 — App Store Page (Jina-rendered, includes IAP section)
═══════════════════════════════════════
${appStorePageMarkdown.slice(0, 8000)}

═══════════════════════════════════════
SECTION 7 — Developer Website
═══════════════════════════════════════
Homepage:
${developerSite?.homepage.slice(0, 1500) || "Not available"}

Pricing Page (secondary source — use only if Section 3 IAP is empty):
${developerSite?.pricing.slice(0, 6000) || "Not available — if Section 3 IAP is also empty, output pricingTiers: []."}

═══════════════════════════════════════
SECTION 8 — Reddit Community Posts
═══════════════════════════════════════
${redditLines}

═══════════════════════════════════════

Return ONLY valid JSON (no markdown, no preamble) matching this schema:
{
  "appName": "exact name from iTunes",
  "platforms": ["iOS"],
  "rating": 0.0,
  "reviewCount": 0,
  "category": "exact category from iTunes",
  "lastUpdated": "human-readable date from iTunes lastUpdated",
  "description": "1 sentence: what the app does and who it serves.",
  "pricingModel": "Free | Freemium | Paid | Paymium",
  "pricingTiers": [
    { "name": "tier name", "price": "$X/mo or Free", "period": "month | year | one-time | free", "features": ["short feature", "short feature", "short feature"], "isPopular": false }
  ],
  "monthlyDownloads": "N/A",
  "momGrowth": "N/A",
  "growthDir": "up | down | unknown",
  "topCountry": "United States",
  "trafficSource": "App Store",
  "positiveSignals": [
    { "theme": "2–5 word theme", "frequency": "e.g. 8 of 20 positive reviews", "quote": "tight paraphrase under 20 words" }
  ],
  "painPoints": [
    {
      "title": "5–9 word behavioral title — what the user loses or cannot do",
      "severity": "High | Medium | Low",
      "reviewCount": 0,
      "quote": "15–30 words copied near-verbatim from a negative review in Section 4"
    }
  ],
  "communitySummary": "1 sentence on Reddit sentiment, or 'No Reddit data found'.",
  "communityQuotes": ["paraphrased from a Reddit post, under 20 words each"],
  "aiSynthesis": {
    "doesWell": "1 short sentence. The single thing users keep coming back for — the retention hook. Must be specific to this app's reviews, not a generic compliment. Plain English, no buzzwords.",
    "fails": "1 short sentence. The core reason users leave or rate it 1–2 stars. State the problem directly from review patterns — not a diagnosis, not a feature request. Plain English.",
    "implication": "1–2 short sentences. The core PRODUCT bet a new entrant must make — a structural capability difference that requires meaningful engineering to build (weeks to months, not hours). Must describe something that fundamentally changes the user's workflow or removes a repeated behavioral friction from the reviews. HARD REJECTS — never suggest these, they are business or policy changes that require no engineering: transparent pricing, upfront pricing, price before questionnaire, honest refunds, better support, faster support, responsive team, clearer onboarding, honest marketing, lower prices, more content, or any change solvable by a spreadsheet or hiring decision. If a competitor could copy your suggestion in a week without writing code, it is not an implication — throw it out and find a real product bet. 'Build X' must name a specific software capability. 'Win by' must describe a workflow or product architecture that competitors cannot replicate without rebuilding their core."
  }
}`;
}

function extractJson(raw: string): string {
  // Strip markdown fences
  let s = raw.replace(/^```(?:json)?\s*/im, "").replace(/\s*```\s*$/im, "").trim();
  // Find first { and last } in case there's leading/trailing prose
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) s = s.slice(start, end + 1);
  return s;
}

export async function analyzeNodeWithClaude(
  rawData: IOSRawData,
  nodeId: string
): Promise<NodeReport> {
  const prompt = buildNodePrompt(rawData);

  for (let attempt = 1; attempt <= 2; attempt++) {
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    try {
      const parsed = JSON.parse(extractJson(raw));
      return { nodeId, icon: rawData.iTunes.iconUrl, ...parsed } as NodeReport;
    } catch (e) {
      console.error(`[claude] JSON parse failed (attempt ${attempt}):`, e);
      if (attempt === 2) throw new Error("Claude returned unparseable JSON after 2 attempts");
    }
  }

  throw new Error("Analysis failed");
}
