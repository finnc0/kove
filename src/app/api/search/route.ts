import { NextResponse } from "next/server";

export interface AppSearchResult {
  appId: string;
  name: string;
  url: string;
  iconUrl: string;
  rating: number;
  reviews: number;
  developer: string;
  platform: "ios";
  genre: string;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ error: "q required" }, { status: 400 });

  try {
    const store = require("app-store-scraper");

    const normalize = (raw: Record<string, unknown>[]): AppSearchResult[] =>
      raw.map((r) => ({
        appId: String(r.id ?? r.appId ?? ""),
        name: String(r.title ?? r.name ?? ""),
        url: String(r.url ?? ""),
        iconUrl: String(r.icon ?? r.artworkUrl100 ?? ""),
        rating: Number(r.score ?? r.rating ?? 0),
        reviews: Number(r.reviews ?? r.ratings ?? 0),
        developer: String(r.developer ?? ""),
        platform: "ios",
        genre: String(r.primaryGenre ?? ""),
      }));

    // Apple's search API is unreliable with short brand-name queries —
    // retry with fallback terms before giving up.
    const attempts = [q, `${q} app`, `${q} -`];
    for (const term of attempts) {
      try {
        const raw = await store.search({ term, num: 6, country: "us" });
        if (raw?.length) return NextResponse.json(normalize(raw));
      } catch (e) {
        console.error(`[search] attempt "${term}" failed:`, e);
      }
    }

    return NextResponse.json([]);
  } catch (err) {
    console.error("[search] fatal:", err);
    return NextResponse.json({ error: "Search unavailable" }, { status: 503 });
  }
}
