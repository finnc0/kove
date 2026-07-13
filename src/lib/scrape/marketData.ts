import { parseKpi } from './parseKpi'
import appStoreScraper from 'app-store-scraper'

export interface ScrapeResult {
  ok: boolean
  downloads: number | null
  revenue: number | null
  error?: string
}

// Industry-standard approximation: iOS users rate at roughly 1-in-40 installs.
// Lifetime installs → monthly active at ~10% → monthly downloads ~10% of active.
const RATINGS_TO_LIFETIME = 40
const LIFETIME_TO_MONTHLY = 0.10

export async function scrapeMarketData(
  appStoreId: string,
  country = 'US',
): Promise<ScrapeResult> {
  try {
    const appData = await appStoreScraper.app({
      id: Number(appStoreId),
      country: country.toLowerCase(),
    }) as {
      ratings?: number
      ratingCount?: number
      price?: number
      free?: boolean
    }

    const ratingCount: number = (appData.ratings ?? appData.ratingCount) ?? 0
    if (!ratingCount) {
      return { ok: false, downloads: null, revenue: null, error: 'No rating data' }
    }

    const lifetimeDownloads = ratingCount * RATINGS_TO_LIFETIME
    const monthlyDownloads  = Math.round(lifetimeDownloads * LIFETIME_TO_MONTHLY)

    const price = appData.price ?? 0
    // Paid app: monthly new installs × price
    // Free app: 3% subscription conversion × $6/mo average
    const monthlyRevenue = price > 0
      ? Math.round(monthlyDownloads * price)
      : Math.round(monthlyDownloads * 0.03 * 6)

    return { ok: true, downloads: monthlyDownloads, revenue: monthlyRevenue }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    console.error('[marketData] estimate failed', appStoreId, error)
    return { ok: false, downloads: null, revenue: null, error }
  }
}

// Re-export parseKpi in case it's needed elsewhere
export { parseKpi }
