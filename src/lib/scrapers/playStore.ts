/* eslint-disable @typescript-eslint/no-explicit-any */

export interface AppResult {
  id: string;
  title: string;
  developer: string;
  rating: number;
  reviews: number;
  price: number;
  free: boolean;
  description: string;
  url: string;
  genre: string;
  version: string;
  updated: string;
  histogram: Record<string, number>;
  offersIAP: boolean;
  inAppProductPrice: string;
  developerWebsite: string;
  platform: "android";
}

export interface ReviewResult {
  rating: number;
  title: string;
  text: string;
  thumbsUp: number;
  date: string;
}

function normalize(r: any): AppResult {
  return {
    id:          String(r.appId ?? r.id ?? ""),
    title:       r.title ?? r.name ?? "",
    developer:   r.developer ?? "",
    rating:      Number(r.score ?? r.rating ?? 0),
    reviews:     Number(r.reviews ?? r.ratings ?? 0),
    price:       Number(r.price ?? 0),
    free:        r.free ?? r.price === 0,
    description: String(r.description ?? r.summary ?? "").slice(0, 1200),
    url:         r.url ?? `https://play.google.com/store/apps/details?id=${r.appId}`,
    genre:       r.genre ?? r.genreId ?? "",
    version:     r.version ?? "",
    updated:     r.updated ?? "",
    histogram:        r.histogram ?? {},
    offersIAP:         r.offersIAP ?? false,
    inAppProductPrice: r.inAppProductPrice ?? "",
    developerWebsite:  r.developerWebsite ?? "",
    platform:          "android",
  };
}

function normalizeReview(r: any): ReviewResult {
  return {
    rating:    Number(r.score ?? 0),
    title:     r.title ?? "",
    text:      r.text ?? "",
    thumbsUp:  Number(r.thumbsUp ?? 0),
    date:      r.date ?? "",
  };
}

export async function searchPlayStore(keyword: string, limit = 10): Promise<AppResult[]> {
  try {
    const gplay = require("google-play-scraper");
    const results = await gplay.search({ term: keyword, num: limit, country: "us", lang: "en" });
    return (results as any[]).map(normalize);
  } catch (e) {
    console.error("[playStore] search:", e);
    return [];
  }
}

export async function getAppById(appId: string): Promise<AppResult | null> {
  try {
    const gplay = require("google-play-scraper");
    return normalize(await gplay.app({ appId, country: "us", lang: "en" }));
  } catch { return null; }
}

export async function getReviews(appId: string, num = 50, sort = "HELPFULNESS"): Promise<ReviewResult[]> {
  try {
    const gplay = require("google-play-scraper");
    const sortKey = gplay.sort[sort] ?? gplay.sort.HELPFULNESS;
    const { data } = await gplay.reviews({ appId, num, sort: sortKey, country: "us", lang: "en" });
    return (data as any[]).map(normalizeReview);
  } catch { return []; }
}

export async function getSimilarApps(appId: string): Promise<AppResult[]> {
  try {
    const gplay = require("google-play-scraper");
    const results = await gplay.similar({ appId, country: "us", lang: "en" });
    return (results as any[]).slice(0, 6).map(normalize);
  } catch { return []; }
}

export function extractPlayStoreId(url: string): string | null {
  const m = url.match(/[?&]id=([^&]+)/);
  return m ? m[1] : null;
}

/** Histogram from app details — { "1": N, "2": N, ... "5": N } */
export function histogramPct(histogram: Record<string, number>, total: number): Record<string, number> {
  const pct: Record<string, number> = {};
  if (total > 0) {
    for (const star of ["1","2","3","4","5"]) {
      pct[star] = Math.round(((histogram[star] ?? 0) / total) * 100);
    }
  }
  return pct;
}
