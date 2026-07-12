import { prisma } from '@/lib/prisma'
import { scrapeMarketData } from './marketData'

const TTL_OK_DAYS  = 14   // re-scrape successful results after 14 days
const TTL_ERR_HOURS = 24  // retry failed scrapes after 24 hours

export async function getScrapedEstimate(appStoreId: string, country = 'US') {
  const cached = await prisma.scrapedEstimate.findUnique({
    where: { appStoreId_country: { appStoreId, country } },
  })

  const now = new Date()

  if (cached) {
    const ageMs = now.getTime() - cached.scrapedAt.getTime()
    const ttlMs = cached.ok
      ? TTL_OK_DAYS * 24 * 60 * 60 * 1000
      : TTL_ERR_HOURS * 60 * 60 * 1000

    if (ageMs < ttlMs) {
      return cached
    }
  }

  // Cache miss or stale — run a live scrape
  const result = await scrapeMarketData(appStoreId, country)

  const upserted = await prisma.scrapedEstimate.upsert({
    where: { appStoreId_country: { appStoreId, country } },
    create: {
      appStoreId,
      country,
      downloads: result.downloads,
      revenue: result.revenue,
      scrapedAt: now,
      ok: result.ok,
      error: result.error ?? null,
    },
    update: {
      downloads: result.downloads,
      revenue: result.revenue,
      scrapedAt: now,
      ok: result.ok,
      error: result.error ?? null,
    },
  })

  return upserted
}
