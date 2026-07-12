/** Fetch readable web content via Jina AI's r.jina.ai reader */
export async function fetchWebContent(url: string, maxChars = 4000): Promise<string> {
  try {
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
        Accept: "text/plain",
        "X-Return-Format": "text",
      },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return "";
    const text = await res.text();
    return text.slice(0, maxChars);
  } catch (e) {
    console.error("[jina] fetch error:", e);
    return "";
  }
}

/**
 * Scrape the pricing/plans page for a given developer website.
 * Tries /pricing and /plans simultaneously; returns the richer result.
 */
export async function fetchPricingPage(developerWebsite: string, maxChars = 3000): Promise<string> {
  const base = developerWebsite.replace(/\/$/, "");
  if (!base) return "";

  const candidates = [`${base}/pricing`, `${base}/plans`];
  const results = await Promise.all(candidates.map(url => fetchWebContent(url, maxChars)));

  // Return the longest result — more text = more pricing detail captured
  const best = results.reduce((a, b) => (a.length >= b.length ? a : b), "");
  return best;
}
