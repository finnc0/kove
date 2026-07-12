/* eslint-disable @typescript-eslint/no-explicit-any */

export interface AppResult {
  id: string;
  title: string;
  developer: string;
  developerId: string;
  rating: number;
  reviews: number;
  price: number;
  free: boolean;
  description: string;
  url: string;
  developerWebsite: string;
  genre: string;
  version: string;
  updated: string;
  platform: "ios";
}

export interface ReviewResult {
  rating: number;
  title: string;
  text: string;
  date: string;
}

export interface RatingHistogram {
  total: number;
  histogram: Record<string, number>;
  // pre-computed percentages
  pct: Record<string, number>;
}

function normalize(r: any): AppResult {
  return {
    id:          String(r.id ?? r.appId ?? ""),
    title:       r.title ?? r.name ?? "",
    developer:   r.developer ?? "",
    developerId: r.developerId ?? "",
    rating:      Number(r.score ?? r.rating ?? 0),
    reviews:     Number(r.reviews ?? r.ratings ?? 0),
    price:       Number(r.price ?? 0),
    free:        r.free ?? r.price === 0,
    description:      String(r.description ?? "").slice(0, 1200),
    url:              r.url ?? "",
    developerWebsite: r.developerWebsite ?? "",
    genre:            r.genre ?? r.primaryGenreName ?? "",
    version:     r.version ?? "",
    updated:     r.updated ?? r.currentVersionReleaseDate ?? "",
    platform:    "ios",
  };
}

function normalizeReview(r: any): ReviewResult {
  return {
    rating: Number(r.score ?? 0),
    title:  r.title ?? "",
    text:   r.text ?? "",
    date:   r.updated ?? r.date ?? "",
  };
}

export async function searchAppStore(keyword: string, limit = 10): Promise<AppResult[]> {
  try {
    const store = require("app-store-scraper");
    const results = await store.search({ term: keyword, num: limit, country: "us" });
    return (results as any[]).map(normalize);
  } catch (e) {
    console.error("[appStore] search:", e);
    return [];
  }
}

export async function getAppById(appId: string): Promise<AppResult | null> {
  try {
    const store = require("app-store-scraper");
    return normalize(await store.app({ id: appId, country: "us" }));
  } catch { return null; }
}

export async function getReviews(appId: string, page = 1, sort = "RECENT", limit = 50): Promise<ReviewResult[]> {
  try {
    const store = require("app-store-scraper");
    const sortKey = store.sort[sort] ?? store.sort.RECENT;
    const results = await store.reviews({ id: appId, page, sort: sortKey, country: "us" });
    return (results as any[]).slice(0, limit).map(normalizeReview);
  } catch { return []; }
}

export async function getRatings(appId: string): Promise<RatingHistogram | null> {
  try {
    const store = require("app-store-scraper");
    const data = await store.ratings({ id: appId, country: "us" });
    const total = data.ratings ?? 0;
    const histogram: Record<string, number> = data.histogram ?? {};
    const pct: Record<string, number> = {};
    if (total > 0) {
      for (const star of ["1","2","3","4","5"]) {
        pct[star] = Math.round(((histogram[star] ?? 0) / total) * 100);
      }
    }
    return { total, histogram, pct };
  } catch { return null; }
}

export async function getSimilarApps(appId: string): Promise<AppResult[]> {
  try {
    const store = require("app-store-scraper");
    const results = await store.similar({ id: appId, country: "us" });
    return (results as any[]).slice(0, 6).map(normalize);
  } catch { return []; }
}

export function extractAppStoreId(url: string): string | null {
  const m = url.match(/\/id(\d+)/);
  return m ? m[1] : null;
}
