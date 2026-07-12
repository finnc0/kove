export interface AppEstimate {
  downloads: number | null;
  revenue: number | null;
  scrapedAt: string | null;
}

/**
 * Normalizes any stored estimate shape into the current flat AppEstimate.
 * Handles the legacy nested shape ({ downloads: { monthlyMidpoint } }) and
 * the current flat shape ({ downloads: number | null }).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeEstimate(raw: any): AppEstimate | null {
  if (!raw) return null;

  // Legacy shape: downloads was a DownloadEstimate object
  const dl = raw.downloads;
  const rv = raw.revenue;

  const downloads: number | null =
    typeof dl === 'number' ? dl
    : typeof dl?.monthlyMidpoint === 'number' ? dl.monthlyMidpoint
    : null;

  const revenue: number | null =
    typeof rv === 'number' ? rv
    : typeof rv?.monthlyMidpoint === 'number' ? rv.monthlyMidpoint
    : null;

  if (downloads === null && revenue === null) return null;

  return {
    downloads,
    revenue,
    scrapedAt: raw.scrapedAt ?? raw.refinedAt ?? null,
  };
}
