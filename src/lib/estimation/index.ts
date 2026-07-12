import { getScrapedEstimate } from '@/lib/scrape/getScrapedEstimate'
import type { AppEstimate } from './types'

export type { AppEstimate }

/**
 * Returns live market data for an app.
 * Returns null if the scrape fails so callers can omit the estimate section.
 */
export async function getAppEstimate(
  appStoreId: string,
  country = 'US',
): Promise<AppEstimate | null> {
  try {
    const result = await getScrapedEstimate(appStoreId, country)
    if (!result.ok || (result.downloads === null && result.revenue === null)) {
      return null
    }
    return {
      downloads: result.downloads,
      revenue:   result.revenue,
      scrapedAt: result.scrapedAt?.toISOString() ?? null,
    }
  } catch {
    return null
  }
}
