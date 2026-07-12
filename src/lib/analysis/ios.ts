import { fetchWebContent, fetchPricingPage } from "@/lib/scrapers/jina";
import { searchReddit } from "@/lib/scrapers/reddit";

// ─── Chart data cache ─────────────────────────────────────────────────────────
// Module-level cache so repeated analyses within the same server process reuse
// the same chart data rather than hitting Apple's servers on every request.
// TTL: 1 hour (charts update roughly daily but we want fresh-enough data).

const chartCache = new Map<string, { data: unknown; expiresAt: number }>();
const CHART_CACHE_TTL_MS = 60 * 60 * 1_000; // 1 hour

const APPLE_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

async function fetchChartCached(url: string): Promise<unknown> {
  const now = Date.now();
  const cached = chartCache.get(url);
  if (cached && cached.expiresAt > now) return cached.data;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8_000), headers: { "User-Agent": APPLE_UA } });
    if (!res.ok) return {};
    const data = await res.json();
    chartCache.set(url, { data, expiresAt: now + CHART_CACHE_TTL_MS });
    return data;
  } catch {
    return {};
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface iTunesMetadata {
  appId: string;
  name: string;
  developerName: string;
  developerId: number;
  bundleId: string;
  category: string;
  categoryId: number;
  rating: number;
  ratingCount: number;
  ratingCurrentVersion: number;
  ratingCountCurrentVersion: number;
  price: number;
  currency: string;
  description: string;
  version: string;
  minimumOsVersion: string;
  lastUpdated: string;
  releaseDate: string;
  iconUrl: string;
  screenshotUrls: string[];
  ipadScreenshotUrls: string[];
  contentRating: string;
  languages: string[];
  fileSize: string;
  sellerUrl: string;
}

export interface RawReview {
  id: string;
  rating: number;
  title: string;
  body: string;
  author: string;
  version: string;
  voteSum: number;
  voteCount: number;
  date: string;
}

export interface IAPItem {
  name: string;
  price: number;
  formattedPrice: string;
}

export interface ChartPosition {
  topFreeRank: number | null;
  topPaidRank: number | null;
  topGrossingRank: number | null;
  categoryFreeRank: number | null;
  categoryGrossingRank: number | null;
}

export interface VelocitySignals {
  totalRatings: number;
  currentVersionRatings: number;
  estimatedDownloadRange: string;
  velocityNote: string;
}

export interface IOSRawData {
  source: "ios";
  fetchedAt: string;
  iTunes: iTunesMetadata;
  reviews: {
    total: number;
    negative: RawReview[];
    positive: RawReview[];
  };
  charts: ChartPosition;
  iap: IAPItem[];
  appStorePageMarkdown: string;
  developerSite: { homepage: string; pricing: string } | null;
  reddit: { title: string; body: string; score: number; subreddit: string; url: string }[];
  velocitySignals: VelocitySignals;
}

// ─── URL / ID helpers ─────────────────────────────────────────────────────────

export function extractAppId(input: string): string | null {
  const match = input.match(/id(\d+)/);
  if (match) return match[1];
  if (/^\d+$/.test(input)) return input;
  return null;
}

function extractAppSlug(url: string): string {
  return url.match(/\/app\/([^/]+)\/id/)?.[1] ?? "app";
}

// ─── iTunes Search API ────────────────────────────────────────────────────────

export async function fetchiTunesMetadata(appId: string): Promise<iTunesMetadata | null> {
  // Try US first, then fall back to other storefronts for region-restricted apps
  const countries = ["us", "gb", "au", "ca"];
  for (const country of countries) {
    try {
      const res = await fetch(
        `https://itunes.apple.com/lookup?id=${appId}&country=${country}&entity=software`,
        { signal: AbortSignal.timeout(10_000), headers: { "User-Agent": APPLE_UA } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const r = data?.results?.[0];
      if (!r) continue;

      return {
        appId,
        name: r.trackName ?? "",
        developerName: r.artistName ?? "",
        developerId: r.artistId ?? 0,
        bundleId: r.bundleId ?? "",
        category: r.primaryGenreName ?? "",
        categoryId: r.primaryGenreId ?? 0,
        rating: r.averageUserRating ?? 0,
        ratingCount: r.userRatingCount ?? 0,
        ratingCurrentVersion: r.averageUserRatingForCurrentVersion ?? 0,
        ratingCountCurrentVersion: r.userRatingCountForCurrentVersion ?? 0,
        price: r.price ?? 0,
        currency: r.currency ?? "USD",
        description: String(r.description ?? "").slice(0, 2000),
        version: r.version ?? "",
        minimumOsVersion: r.minimumOsVersion ?? "",
        lastUpdated: r.currentVersionReleaseDate ?? "",
        releaseDate: r.releaseDate ?? "",
        iconUrl: r.artworkUrl512 ?? r.artworkUrl100 ?? "",
        screenshotUrls: r.screenshotUrls ?? [],
        ipadScreenshotUrls: r.ipadScreenshotUrls ?? [],
        contentRating: r.contentAdvisoryRating ?? "",
        languages: r.languageCodesISO2A ?? [],
        fileSize: r.fileSizeBytes ?? "",
        sellerUrl: r.sellerUrl ?? "",
      };
    } catch (e) {
      console.error(`[ios] iTunes lookup failed (${country}):`, e);
    }
  }
  return null;
}

// ─── Apple RSS Review Feed ────────────────────────────────────────────────────

async function fetchReviewPage(appId: string, page: number): Promise<RawReview[]> {
  try {
    const url = `https://itunes.apple.com/us/rss/customerreviews/page=${page}/id=${appId}/sortBy=mostHelpful/json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8_000), headers: { "User-Agent": APPLE_UA } });
    if (!res.ok) return [];
    const data = await res.json();
    const entries: unknown[] = data?.feed?.entry ?? [];
    // First entry is app metadata, not a review
    const reviews = entries.filter((e): e is Record<string, unknown> =>
      typeof e === "object" && e !== null && "im:rating" in e
    );
    return reviews.map((e) => ({
      id: String((e["id"] as Record<string, unknown>)?.["label"] ?? ""),
      rating: Number((e["im:rating"] as Record<string, unknown>)?.["label"] ?? 0),
      title: String((e["title"] as Record<string, unknown>)?.["label"] ?? ""),
      body: String((e["content"] as Record<string, unknown>)?.["label"] ?? "").slice(0, 800),
      author: String(
        ((e["author"] as Record<string, unknown>)?.["name"] as Record<string, unknown>)?.["label"] ?? ""
      ),
      version: String((e["im:version"] as Record<string, unknown>)?.["label"] ?? ""),
      voteSum: Number((e["im:voteSum"] as Record<string, unknown>)?.["label"] ?? 0),
      voteCount: Number((e["im:voteCount"] as Record<string, unknown>)?.["label"] ?? 0),
      date: String((e["updated"] as Record<string, unknown>)?.["label"] ?? ""),
    }));
  } catch {
    return [];
  }
}

export async function fetchAllReviews(appId: string): Promise<RawReview[]> {
  const all: RawReview[] = [];
  for (let page = 1; page <= 10; page++) {
    const reviews = await fetchReviewPage(appId, page);
    if (!reviews.length) break;
    all.push(...reviews);
    if (page < 10) await new Promise((r) => setTimeout(r, 300));
  }
  return all;
}

// ─── Apple RSS Chart Feeds ────────────────────────────────────────────────────

export async function checkChartPositions(appId: string, categoryId: number): Promise<ChartPosition> {
  const findRank = (feed: Record<string, unknown>, id: string): number | null => {
    const entries = (
      (feed?.feed as Record<string, unknown>)?.entry as Record<string, unknown>[]
    ) ?? [];
    // Use string comparison — chart feeds return IDs as strings, type coercion bugs are common
    const idx = entries.findIndex(
      (e) =>
        String(
          ((e?.id as Record<string, unknown>)?.attributes as Record<string, unknown>)?.["im:id"] ?? ""
        ) === String(id)
    );
    return idx === -1 ? null : idx + 1;
  };

  try {
    const [free, paid, grossing, catFree, catGrossing] = await Promise.allSettled([
      fetchChartCached("https://itunes.apple.com/us/rss/topfreeapplications/limit=200/json"),
      fetchChartCached("https://itunes.apple.com/us/rss/toppaidapplications/limit=200/json"),
      fetchChartCached("https://itunes.apple.com/us/rss/topgrossingapplications/limit=200/json"),
      categoryId
        ? fetchChartCached(`https://itunes.apple.com/us/rss/topfreeapplications/limit=200/genre=${categoryId}/json`)
        : Promise.resolve({}),
      categoryId
        ? fetchChartCached(`https://itunes.apple.com/us/rss/topgrossingapplications/limit=200/genre=${categoryId}/json`)
        : Promise.resolve({}),
    ]);

    const get = (r: PromiseSettledResult<unknown>) =>
      r.status === "fulfilled" ? (r.value as Record<string, unknown>) : {};

    return {
      topFreeRank:       findRank(get(free),       appId),
      topPaidRank:       findRank(get(paid),       appId),
      topGrossingRank:   findRank(get(grossing),   appId),
      categoryFreeRank:  findRank(get(catFree),    appId),
      categoryGrossingRank: findRank(get(catGrossing), appId),
    };
  } catch {
    return { topFreeRank: null, topPaidRank: null, topGrossingRank: null, categoryFreeRank: null, categoryGrossingRank: null };
  }
}

// ─── Velocity signals ─────────────────────────────────────────────────────────

export function calculateVelocitySignals(meta: iTunesMetadata): VelocitySignals {
  const fmt = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return String(n);
  };
  const min = Math.round(meta.ratingCount * 50);
  const max = Math.round(meta.ratingCount * 100);
  return {
    totalRatings: meta.ratingCount,
    currentVersionRatings: meta.ratingCountCurrentVersion,
    estimatedDownloadRange: `${fmt(min)}–${fmt(max)}`,
    velocityNote:
      "Estimated from rating count using 1–2% rating rate industry benchmark. Not an exact figure.",
  };
}

function decodeHtmlEntities(s: string): string {
  return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

// Scrape IAP data directly from the App Store page HTML.
// The <dt>In-App Purchases</dt> section is SSR'd in the static HTML as a <dd> block.
export async function fetchIAP(appId: string, appSlug = "app"): Promise<IAPItem[]> {
  try {
    const url = `https://apps.apple.com/us/app/${appSlug}/id${appId}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return [];

    const html = await res.text();

    const dtIdx = html.indexOf("In-App Purchases</dt>");
    if (dtIdx === -1) return [];

    // Find the <dd that follows the <dt> — handles <dd> and <dd class="...">
    const ddTagStart = html.indexOf("<dd", dtIdx);
    if (ddTagStart === -1) return [];
    const ddTagEnd = html.indexOf(">", ddTagStart);
    if (ddTagEnd === -1) return [];

    // Walk forward tracking <dd> depth so nested <dd> elements don't cut us short
    let depth = 1;
    let pos = ddTagEnd + 1;
    let sectionEnd = -1;
    while (pos < html.length && depth > 0) {
      const nextOpen = html.indexOf("<dd", pos);
      const nextClose = html.indexOf("</dd>", pos);
      if (nextClose === -1) break;
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        pos = nextOpen + 3;
      } else {
        depth--;
        if (depth === 0) { sectionEnd = nextClose + 5; break; }
        pos = nextClose + 5;
      }
    }

    const section = sectionEnd !== -1
      ? html.slice(ddTagStart, sectionEnd)
      : html.slice(ddTagStart, Math.min(ddTagStart + 12_000, html.length));

    const items: IAPItem[] = [];
    // <span[^>]*> handles both bare <span> and <span class="...">
    const itemRe = /<span[^>]*>([^<]{2,80})<\/span>\s*<span[^>]*>(\$[\d,.]+)<\/span>/g;
    let match;
    const seen = new Set<string>();

    while ((match = itemRe.exec(section)) !== null) {
      const name = decodeHtmlEntities(match[1].trim());
      const formattedPrice = match[2].trim();
      const price = parseFloat(formattedPrice.replace(/[$,]/g, ""));
      if (!name || isNaN(price) || price <= 0) continue;
      const key = `${name}|${formattedPrice}`;
      if (!seen.has(key)) {
        seen.add(key);
        items.push({ name, price, formattedPrice });
      }
    }

    return items;
  } catch {
    return [];
  }
}

// ─── Parse IAP from Jina-rendered markdown ───────────────────────────────────
// The Apple App Store page is JavaScript-rendered, so the raw HTML scraper
// above often returns nothing. Jina (r.jina.ai) renders JS, so the markdown
// version reliably contains the In-App Purchases section.

export function parseIAPFromMarkdown(markdown: string): IAPItem[] {
  const lower = markdown.toLowerCase();
  const iapIdx = lower.indexOf("in-app purchase");
  if (iapIdx === -1) return [];

  // Extract up to 4000 chars around the IAP section
  const section = markdown.slice(iapIdx, iapIdx + 4000);
  const lines = section.split("\n");
  const items: IAPItem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const priceMatch = line.match(/\$(\d+(?:\.\d{2})?)/);
    if (!priceMatch) continue;

    const price = parseFloat(priceMatch[1]);
    if (isNaN(price) || price <= 0 || price >= 1000) continue;

    // Name is before the price on the same line, or the prior non-empty line
    const beforePrice = line.slice(0, line.indexOf("$")).replace(/[•\-*|[\]]/g, "").trim();
    let name = beforePrice.length >= 2 ? beforePrice : "";
    if (!name && i > 0) {
      name = lines[i - 1].trim().replace(/[•\-*|[\]#]/g, "").trim();
    }

    if (!name || name.length < 2) continue;

    const key = `${name}|${price}`;
    if (!seen.has(key)) {
      seen.add(key);
      items.push({ name, price, formattedPrice: `$${price.toFixed(2)}` });
    }
    if (items.length >= 12) break;
  }

  return items;
}

// ─── Full iOS data gather ─────────────────────────────────────────────────────

export async function gatherIOSData(
  appUrl: string,
  onProgress?: (step: string) => void
): Promise<IOSRawData> {
  const appId = extractAppId(appUrl);
  if (!appId) throw new Error(`Could not extract App ID from: ${appUrl}`);

  onProgress?.("itunes");
  const iTunes = await fetchiTunesMetadata(appId);
  if (!iTunes) throw new Error(`App not found in iTunes API for ID: ${appId}`);

  onProgress?.("charts");
  const appSlug = extractAppSlug(appUrl);
  const [charts, allReviews, htmlIap] = await Promise.all([
    checkChartPositions(appId, iTunes.categoryId),
    fetchAllReviews(appId),
    fetchIAP(appId, appSlug),
  ]);

  const negative = allReviews
    .filter((r) => r.rating <= 2)
    .sort((a, b) => b.voteSum - a.voteSum)
    .slice(0, 100);
  const positive = allReviews
    .filter((r) => r.rating >= 4)
    .sort((a, b) => b.voteSum - a.voteSum)
    .slice(0, 100);

  onProgress?.("jina");
  const appStoreUrl = `https://apps.apple.com/us/app/${appSlug}/id${appId}`;
  // Fetch enough content that the IAP section (usually near page bottom) isn't cut off
  const appStorePageMarkdown = await fetchWebContent(appStoreUrl, 20000);

  // Use HTML scraper if it got data; fall back to Jina-parsed IAP
  const iap = htmlIap.length > 0 ? htmlIap : parseIAPFromMarkdown(appStorePageMarkdown);

  let developerSite: IOSRawData["developerSite"] = null;
  if (iTunes.sellerUrl) {
    const [homepage, pricing] = await Promise.all([
      fetchWebContent(iTunes.sellerUrl, 2000),
      fetchPricingPage(iTunes.sellerUrl, 8000),
    ]);
    developerSite = { homepage, pricing };
  }

  onProgress?.("reddit");
  const redditPosts = await searchReddit(`"${iTunes.name}" app review`, 8);
  const redditComplaints = await searchReddit(`"${iTunes.name}" complaints problems`, 6);
  const seen = new Set<string>();
  const reddit = [...redditPosts, ...redditComplaints]
    .filter((p) => { if (seen.has(p.permalink)) return false; seen.add(p.permalink); return true; })
    .sort((a, b) => b.score - a.score)
    .slice(0, 15)
    .map((p) => ({
      title: p.title,
      body: p.text,
      score: p.score,
      subreddit: p.subreddit,
      url: `https://reddit.com${p.permalink}`,
    }));

  const velocitySignals = calculateVelocitySignals(iTunes);

  return {
    source: "ios",
    fetchedAt: new Date().toISOString(),
    iTunes,
    reviews: { total: allReviews.length, negative, positive },
    charts,
    iap,
    appStorePageMarkdown,
    developerSite,
    reddit,
    velocitySignals,
  };
}
