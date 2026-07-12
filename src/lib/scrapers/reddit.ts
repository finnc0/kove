/* eslint-disable @typescript-eslint/no-explicit-any */

export interface RedditPost {
  title: string;
  text: string;
  score: number;
  permalink: string;
  subreddit: string;
  numComments: number;
}

export async function searchReddit(query: string, limit = 12): Promise<RedditPost[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      sort: "relevance",
      t: "year",
      limit: String(limit),
      type: "link",
    });
    const res = await fetch(`https://www.reddit.com/search.json?${params}`, {
      headers: { "User-Agent": "Kove-market-research/1.0" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.data?.children ?? []).map((p: any) => ({
      title: p.data.title ?? "",
      text: String(p.data.selftext ?? "").slice(0, 600),
      score: Number(p.data.score ?? 0),
      permalink: p.data.permalink ?? "",
      subreddit: p.data.subreddit ?? "",
      numComments: Number(p.data.num_comments ?? 0),
    }));
  } catch (e) {
    console.error("[reddit] search error:", e);
    return [];
  }
}

export async function getPostComments(permalink: string, limit = 8): Promise<string[]> {
  try {
    const url = `https://www.reddit.com${permalink}.json?limit=${limit}&sort=top`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Kove-market-research/1.0" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return [];
    const json = await res.json();
    const comments = json?.[1]?.data?.children ?? [];
    return comments
      .filter((c: any) => c.kind === "t1" && c.data?.body && c.data.body !== "[deleted]" && c.data.body !== "[removed]")
      .slice(0, limit)
      .map((c: any) => String(c.data.body).slice(0, 400));
  } catch {
    return [];
  }
}
