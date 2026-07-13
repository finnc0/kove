import { parseKpi } from './parseKpi'

export interface ScrapeResult {
  ok: boolean
  downloads: number | null
  revenue: number | null
  error?: string
}

const ST_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

/**
 * Fetches download + revenue estimates from SensorTower using plain HTTP.
 * SensorTower embeds "X downloads and $Y revenue" in the page meta description,
 * publicly, no login required — one GET request, no browser.
 */
export async function scrapeMarketData(
  appStoreId: string,
  country = 'US',
): Promise<ScrapeResult> {
  try {
    const url = `https://app.sensortower.com/ios/${country.toUpperCase()}/-/app/-/${appStoreId}/overview`

    const res = await fetch(url, {
      headers: {
        'User-Agent': ST_UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      },
      redirect: 'follow',
    })

    if (!res.ok) {
      return { ok: false, downloads: null, revenue: null, error: `HTTP ${res.status}` }
    }

    const html = await res.text()

    // SensorTower puts estimates in the page meta description:
    // "Last month's estimates were 7m downloads and $900k revenue."
    const metaMatch = html.match(
      /<meta[^>]+name="description"[^>]+content="([^"]*)"[^>]*>/i,
    ) ?? html.match(
      /<meta[^>]+content="([^"]*)"[^>]+name="description"[^>]*>/i,
    )

    if (metaMatch) {
      const desc = metaMatch[1]

      // Pattern: "were 7m downloads and $900k revenue"
      const dlMatch  = desc.match(/(?:were\s+)?([\d,.]+[kmb]?)\s+downloads?/i)
      const revMatch = desc.match(/\$([\d,.]+[kmb]?)\s+revenue/i)

      const downloads = dlMatch  ? parseKpi(dlMatch[1])  : null
      const revenue   = revMatch ? parseKpi(revMatch[1]) : null

      if (downloads !== null || revenue !== null) {
        return { ok: true, downloads, revenue }
      }
    }

    return { ok: false, downloads: null, revenue: null, error: 'Estimates not found in page' }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    console.error('[marketData] ST fetch failed', appStoreId, error)
    return { ok: false, downloads: null, revenue: null, error }
  }
}

export { parseKpi }
