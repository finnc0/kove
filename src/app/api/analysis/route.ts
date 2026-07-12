import { randomUUID } from "crypto";
import * as appStoreScraper from "@/lib/scrapers/appStore";
import * as playStoreScraper from "@/lib/scrapers/playStore";
import { fetchWebContent, fetchPricingPage } from "@/lib/scrapers/jina";
import { searchReddit, getPostComments } from "@/lib/scrapers/reddit";
import { synthesizeReport } from "@/lib/claude";
import { saveReport } from "@/lib/reportStore";
import type { ReportMode } from "@/lib/reportSchema";

export const runtime = "nodejs";
export const maxDuration = 120;

interface AnalysisRequest {
  mode: ReportMode;
  category: string;
  audience?: string;
  angle?: string;
  focusArea?: string;
  urls?: string[];
  project?: string;
}

type SourceId = "web" | "appstore" | "playstore" | "reddit" | "website" | "ai";

function sse(controller: ReadableStreamDefaultController, data: object) {
  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
}

function src(source: SourceId, status: "active" | "done" | "failed") {
  return { type: "source", source, status };
}

function histStr(pct: Record<string, number>): string {
  return ["5","4","3","2","1"].map(s => `${s}★=${pct[s] ?? 0}%`).join(" ");
}

function iosAppBlock(app: appStoreScraper.AppResult, hist?: appStoreScraper.RatingHistogram): string {
  const lines = [
    `[iOS] ${app.title} — ${app.developer}`,
    `Rating: ${app.rating.toFixed(1)}/5 · ${app.reviews.toLocaleString()} reviews · ${app.free ? "Free" : `$${app.price}`} · Genre: ${app.genre}`,
  ];
  if (hist) lines.push(`Star distribution (${hist.total.toLocaleString()} rated): ${histStr(hist.pct)}`);
  if (app.version) lines.push(`Version: ${app.version} · Updated: ${app.updated}`);
  lines.push(`URL: ${app.url}`);
  lines.push(`Description: ${app.description}`);
  return lines.join("\n");
}

function androidAppBlock(app: playStoreScraper.AppResult): string {
  const lines = [
    `[Android] ${app.title} — ${app.developer}`,
    `Rating: ${app.rating.toFixed(1)}/5 · ${app.reviews.toLocaleString()} reviews · ${app.free ? "Free" : `$${app.price}`} · Genre: ${app.genre}`,
  ];
  if (app.histogram && Object.keys(app.histogram).length > 0) {
    const pct = playStoreScraper.histogramPct(app.histogram, app.reviews);
    lines.push(`Star distribution: ${histStr(pct)}`);
  }
  if (app.version) lines.push(`Version: ${app.version} · Updated: ${app.updated}`);
  if (app.inAppProductPrice) lines.push(`In-app purchases: ${app.inAppProductPrice}`);
  else if (app.offersIAP) lines.push(`In-app purchases: offered`);
  lines.push(`URL: ${app.url}`);
  lines.push(`Description: ${app.description}`);
  return lines.join("\n");
}

function reviewBlock(
  reviews: appStoreScraper.ReviewResult[] | playStoreScraper.ReviewResult[],
  label: string
): string {
  if (!reviews.length) return "";
  const header = `=== ${label} ===`;
  const body = reviews
    .map(r => {
      const title = "title" in r && r.title ? `${r.title}: ` : "";
      return `[${r.rating}★] ${title}${r.text}`;
    })
    .join("\n");
  return `${header}\n${body}`;
}

function redditBlock(
  posts: Awaited<ReturnType<typeof searchReddit>>,
  commentsMap: Map<string, string[]>
): string {
  return posts
    .map(p => {
      const lines = [`r/${p.subreddit} · ${p.score} pts · ${p.numComments} comments\n"${p.title}"`];
      if (p.text) lines.push(p.text);
      const c = commentsMap.get(p.permalink);
      if (c?.length) lines.push("Top comments:\n" + c.map(s => `  • ${s}`).join("\n"));
      return lines.join("\n");
    })
    .join("\n\n");
}

function appNameFromUrl(url: string): string {
  const m = url.match(/\/app\/([^/]+)\/id\d+/);
  return m ? m[1].replace(/-/g, " ") : "";
}

export async function POST(req: Request): Promise<Response> {
  const body: AnalysisRequest = await req.json();
  const {
    mode,
    category,
    audience = "",
    angle = "",
    focusArea = "",
    urls = [],
    project = "",
  } = body;

  const stream = new ReadableStream({
    async start(controller) {
      const collected = {
        appStoreApps: "",
        appStoreReviews: "",
        playStoreApps: "",
        playStoreReviews: "",
        redditPosts: "",
        websiteContent: "",
        pricingContent: "",
      };

      const resolvedAppNames: string[] = [];
      // Collect unique developer websites for pricing page scraping
      const developerWebsites = new Map<string, string>(); // appName → website

      try {
        const iosUrls     = urls.filter(u => u.includes("apps.apple.com"));
        const androidUrls = urls.filter(u => u.includes("play.google.com"));
        const otherUrls   = urls.filter(u => !u.includes("apps.apple.com") && !u.includes("play.google.com"));

        // ── App Store ─────────────────────────────────────────────────────
        sse(controller, src("appstore", "active"));

        const iosAppBlocks: string[] = [];
        const iosReviewBlocks: string[] = [];

        if (mode === "market" || mode === "sweep") {
          const searchResults = await appStoreScraper.searchAppStore(category, 8);
          resolvedAppNames.push(...searchResults.slice(0, 3).map(a => a.title));

          // Deep dive on top 3: histogram + 2 review sorts + similar apps
          const deepData = await Promise.all(
            searchResults.slice(0, 3).map(async app => {
              const [ratings, recentReviews, helpfulReviews, similar] = await Promise.all([
                appStoreScraper.getRatings(app.id),
                appStoreScraper.getReviews(app.id, 1, "RECENT", 25),
                appStoreScraper.getReviews(app.id, 1, "HELPFUL", 25),
                appStoreScraper.getSimilarApps(app.id),
              ]);
              return { app, ratings, recentReviews, helpfulReviews, similar };
            })
          );

          // Collect unique similar apps not already in main results
          const mainIds = new Set(searchResults.map(a => a.id));
          const seen = new Set(mainIds);
          const similarUnique: appStoreScraper.AppResult[] = [];
          for (const d of deepData) {
            for (const s of d.similar) {
              if (!seen.has(s.id)) { seen.add(s.id); similarUnique.push(s); }
            }
          }

          for (const d of deepData) {
            iosAppBlocks.push(iosAppBlock(d.app, d.ratings ?? undefined));
            const b1 = reviewBlock(d.recentReviews, `${d.app.title} · Recent Reviews`);
            const b2 = reviewBlock(d.helpfulReviews, `${d.app.title} · Most Helpful Reviews`);
            if (b1) iosReviewBlocks.push(b1);
            if (b2) iosReviewBlocks.push(b2);
            // Collect developer website for pricing page scraping
            if (d.app.developerWebsite) developerWebsites.set(d.app.title, d.app.developerWebsite);
          }
          // Basic info for apps 4-8 (no deep dive)
          for (const app of searchResults.slice(3)) {
            iosAppBlocks.push(iosAppBlock(app));
            if (app.developerWebsite) developerWebsites.set(app.title, app.developerWebsite);
          }
          if (similarUnique.length) {
            iosAppBlocks.push(
              `=== Additional iOS Apps Discovered via Similar ===\n` +
              similarUnique.map(a => iosAppBlock(a)).join("\n\n")
            );
          }
        }

        if (iosUrls.length > 0) {
          const urlApps = (await Promise.all(
            iosUrls.map(u => {
              const id = appStoreScraper.extractAppStoreId(u);
              return id ? appStoreScraper.getAppById(id) : null;
            })
          )).filter(Boolean) as appStoreScraper.AppResult[];

          resolvedAppNames.push(...urlApps.map(a => a.title));

          const deepData = await Promise.all(
            urlApps.map(async app => {
              const [ratings, recentReviews, helpfulReviews, similar] = await Promise.all([
                appStoreScraper.getRatings(app.id),
                appStoreScraper.getReviews(app.id, 1, "RECENT", 30),
                appStoreScraper.getReviews(app.id, 1, "HELPFUL", 30),
                appStoreScraper.getSimilarApps(app.id),
              ]);
              return { app, ratings, recentReviews, helpfulReviews, similar };
            })
          );

          const mainIds = new Set(urlApps.map(a => a.id));
          const seen = new Set(mainIds);
          const similarUnique: appStoreScraper.AppResult[] = [];
          for (const d of deepData) {
            for (const s of d.similar) {
              if (!seen.has(s.id)) { seen.add(s.id); similarUnique.push(s); }
            }
          }

          for (const d of deepData) {
            iosAppBlocks.push(iosAppBlock(d.app, d.ratings ?? undefined));
            const b1 = reviewBlock(d.recentReviews, `${d.app.title} · Recent Reviews`);
            const b2 = reviewBlock(d.helpfulReviews, `${d.app.title} · Most Helpful Reviews`);
            if (b1) iosReviewBlocks.push(b1);
            if (b2) iosReviewBlocks.push(b2);
            if (d.app.developerWebsite) developerWebsites.set(d.app.title, d.app.developerWebsite);
          }
          if (similarUnique.length) {
            iosAppBlocks.push(
              `=== Related iOS Apps ===\n` +
              similarUnique.map(a => iosAppBlock(a)).join("\n\n")
            );
          }
        }

        collected.appStoreApps    = iosAppBlocks.join("\n\n---\n\n");
        collected.appStoreReviews = iosReviewBlocks.join("\n\n");

        sse(controller, src("appstore", collected.appStoreApps ? "done" : "failed"));

        // ── Google Play ───────────────────────────────────────────────────
        sse(controller, src("playstore", "active"));

        const androidAppBlocks: string[] = [];
        const androidReviewBlocks: string[] = [];

        if (mode === "market" || mode === "sweep") {
          const searchResults = await playStoreScraper.searchPlayStore(category, 8);
          if (resolvedAppNames.length === 0) resolvedAppNames.push(...searchResults.slice(0, 3).map(a => a.title));

          const deepData = await Promise.all(
            searchResults.slice(0, 3).map(async app => {
              // Full app details include the histogram; fetch 2 review sorts + similar
              const [fullApp, helpfulReviews, ratingReviews, similar] = await Promise.all([
                playStoreScraper.getAppById(app.id),
                playStoreScraper.getReviews(app.id, 25, "HELPFULNESS"),
                playStoreScraper.getReviews(app.id, 25, "RATING"),
                playStoreScraper.getSimilarApps(app.id),
              ]);
              return { app: fullApp ?? app, helpfulReviews, ratingReviews, similar };
            })
          );

          const mainIds = new Set(searchResults.map(a => a.id));
          const seen = new Set(mainIds);
          const similarUnique: playStoreScraper.AppResult[] = [];
          for (const d of deepData) {
            for (const s of d.similar) {
              if (!seen.has(s.id)) { seen.add(s.id); similarUnique.push(s); }
            }
          }

          for (const d of deepData) {
            androidAppBlocks.push(androidAppBlock(d.app));
            const b1 = reviewBlock(d.helpfulReviews, `${d.app.title} · Most Helpful Reviews`);
            const b2 = reviewBlock(d.ratingReviews,  `${d.app.title} · Reviews Sorted by Rating (Low First)`);
            if (b1) androidReviewBlocks.push(b1);
            if (b2) androidReviewBlocks.push(b2);
            if (d.app.developerWebsite) developerWebsites.set(d.app.title, d.app.developerWebsite);
          }
          for (const app of searchResults.slice(3)) {
            androidAppBlocks.push(androidAppBlock(app));
            if (app.developerWebsite) developerWebsites.set(app.title, app.developerWebsite);
          }
          if (similarUnique.length) {
            androidAppBlocks.push(
              `=== Additional Android Apps Discovered via Similar ===\n` +
              similarUnique.map(a => androidAppBlock(a)).join("\n\n")
            );
          }
        }

        if (androidUrls.length > 0) {
          const urlApps = (await Promise.all(
            androidUrls.map(u => {
              const id = playStoreScraper.extractPlayStoreId(u);
              return id ? playStoreScraper.getAppById(id) : null;
            })
          )).filter(Boolean) as playStoreScraper.AppResult[];

          resolvedAppNames.push(...urlApps.map(a => a.title));

          const deepData = await Promise.all(
            urlApps.map(async app => {
              const [helpfulReviews, ratingReviews, similar] = await Promise.all([
                playStoreScraper.getReviews(app.id, 30, "HELPFULNESS"),
                playStoreScraper.getReviews(app.id, 30, "RATING"),
                playStoreScraper.getSimilarApps(app.id),
              ]);
              return { app, helpfulReviews, ratingReviews, similar };
            })
          );

          const mainIds = new Set(urlApps.map(a => a.id));
          const seen = new Set(mainIds);
          const similarUnique: playStoreScraper.AppResult[] = [];
          for (const d of deepData) {
            for (const s of d.similar) {
              if (!seen.has(s.id)) { seen.add(s.id); similarUnique.push(s); }
            }
          }

          for (const d of deepData) {
            androidAppBlocks.push(androidAppBlock(d.app));
            const b1 = reviewBlock(d.helpfulReviews, `${d.app.title} · Most Helpful Reviews`);
            const b2 = reviewBlock(d.ratingReviews,  `${d.app.title} · Reviews Sorted by Rating (Low First)`);
            if (b1) androidReviewBlocks.push(b1);
            if (b2) androidReviewBlocks.push(b2);
            if (d.app.developerWebsite) developerWebsites.set(d.app.title, d.app.developerWebsite);
          }
          if (similarUnique.length) {
            androidAppBlocks.push(
              `=== Related Android Apps ===\n` +
              similarUnique.map(a => androidAppBlock(a)).join("\n\n")
            );
          }
        }

        collected.playStoreApps    = androidAppBlocks.join("\n\n---\n\n");
        collected.playStoreReviews = androidReviewBlocks.join("\n\n");

        sse(controller, src("playstore", collected.playStoreApps ? "done" : "failed"));

        // ── Pricing pages (parallel with Reddit fetch) ────────────────────
        // Fetch up to 6 unique developer pricing pages simultaneously
        const pricingEntries = [...developerWebsites.entries()].slice(0, 6);
        const pricingFetches = pricingEntries.map(([name, website]) =>
          fetchPricingPage(website, 3000).then(content => ({ name, content }))
        );

        // ── Reddit (runs concurrently with pricing page fetches) ──────────
        sse(controller, src("reddit", "active"));

        const redditSubject =
          category ||
          resolvedAppNames[0] ||
          (iosUrls[0] ? appNameFromUrl(iosUrls[0]) : "") ||
          "app";

        const [generalPosts, painPosts] = await Promise.all([
          searchReddit(`${redditSubject} app review`, 8),
          searchReddit(`${redditSubject} problems complaints`, 8),
        ]);

        // Deduplicate by permalink, sort by score, keep top 12
        const seen = new Map<string, (typeof generalPosts)[number]>();
        for (const p of [...generalPosts, ...painPosts]) {
          if (!seen.has(p.permalink)) seen.set(p.permalink, p);
        }
        const allPosts = [...seen.values()].sort((a, b) => b.score - a.score).slice(0, 12);

        // Fetch comments for top 3 posts that actually have comments
        const topForComments = allPosts.filter(p => p.numComments > 2).slice(0, 3);
        const commentsMap = new Map<string, string[]>();
        const commentResults = await Promise.all(topForComments.map(p => getPostComments(p.permalink, 6)));
        topForComments.forEach((p, i) => {
          if (commentResults[i].length) commentsMap.set(p.permalink, commentResults[i]);
        });

        collected.redditPosts = redditBlock(allPosts, commentsMap);

        sse(controller, src("reddit", collected.redditPosts ? "done" : "failed"));

        // ── Await pricing page results (started earlier, parallel with Reddit) ──
        const pricingResults = await Promise.all(pricingFetches);
        const pricingSections = pricingResults
          .filter(r => r.content.length > 100)
          .map(r => `=== ${r.name} (pricing page) ===\n${r.content}`);
        collected.pricingContent = pricingSections.join("\n\n");

        // ── Web (Reddit is our live signal) ──────────────────────────────
        sse(controller, src("web", "active"));
        sse(controller, src("web", "done"));

        // ── Website content via Jina ──────────────────────────────────────
        if (otherUrls.length > 0) {
          sse(controller, src("website", "active"));
          const pages = await Promise.all(otherUrls.map(u => fetchWebContent(u, 3000)));
          collected.websiteContent = pages.filter(Boolean).join("\n\n---\n\n");
          sse(controller, src("website", collected.websiteContent ? "done" : "failed"));
        }

        // ── Claude synthesis ──────────────────────────────────────────────
        sse(controller, src("ai", "active"));

        const synthesisCategory =
          category ||
          resolvedAppNames.join(", ") ||
          (iosUrls[0] ? appNameFromUrl(iosUrls[0]) : "") ||
          "the provided app";

        const report = await synthesizeReport({
          mode,
          category: synthesisCategory,
          audience,
          angle,
          focusArea,
          ...collected,
        });

        const reportId = randomUUID();
        report.id = reportId;
        report.project = project;
        saveReport(report);

        sse(controller, src("ai", "done"));
        sse(controller, { type: "complete", reportId });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[analysis] pipeline error:", err);
        sse(controller, { type: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
