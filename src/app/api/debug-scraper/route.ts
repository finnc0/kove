export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(req: Request) {
  const appId = new URL(req.url).searchParams.get("id") ?? "389801252";
  const url = `https://app.sensortower.com/ios/US/-/app/-/${appId}/overview`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
      },
      redirect: "follow",
    });

    const html = await res.text();
    const metaMatch =
      html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"[^>]*>/i) ??
      html.match(/<meta[^>]+content="([^"]*)"[^>]+name="description"[^>]*>/i);

    const desc = metaMatch?.[1] ?? null;
    const dlMatch  = desc?.match(/were\s+(\d[\d,.]*\s*[kmb]?)\s+downloads?/i);
    const revMatch = desc?.match(/\$(\d[\d,.]*\s*[kmb]?)\s+revenue/i);

    return Response.json({
      status: res.status,
      finalUrl: res.url,
      htmlLength: html.length,
      htmlSnippet: html.slice(0, 500),
      description: desc,
      dlRaw: dlMatch?.[1] ?? null,
      revRaw: revMatch?.[1] ?? null,
    });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
