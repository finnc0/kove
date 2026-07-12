import { parseKpi } from './parseKpi'

// KPI element selectors (stable aria-labelledby attributes)
const KPI_SELECTORS = {
  downloads: '[aria-labelledby="app-overview-unified-kpi-downloads"]',
  revenue:   '[aria-labelledby="app-overview-unified-kpi-revenue"]',
}

export interface ScrapeResult {
  ok: boolean;
  downloads: number | null;
  revenue: number | null;
  error?: string;
}

// Shared browser singleton — one Chromium instance for all scrape calls
let browserPromise: Promise<import('playwright').Browser> | null = null

async function getBrowser(): Promise<import('playwright').Browser> {
  if (!browserPromise) {
    browserPromise = (async () => {
      const { chromium } = await import('playwright')
      const browser = await chromium.launch({ headless: true })
      // Recreate on unexpected disconnect
      browser.on('disconnected', () => { browserPromise = null })
      return browser
    })()
  }
  return browserPromise
}

// Max 2 concurrent pages to avoid rate limits
const MAX_CONCURRENT = 2
let activePages = 0
const waitQueue: Array<() => void> = []

function acquireSlot(): Promise<void> {
  if (activePages < MAX_CONCURRENT) {
    activePages++
    return Promise.resolve()
  }
  return new Promise((resolve) => waitQueue.push(resolve))
}

function releaseSlot() {
  const next = waitQueue.shift()
  if (next) {
    next()
  } else {
    activePages--
  }
}

export async function scrapeMarketData(
  appStoreId: string,
  country = 'US',
): Promise<ScrapeResult> {
  const url = `https://app.sensortower.com/overview/${appStoreId}?country=${country}`

  await acquireSlot()
  let browser: import('playwright').Browser | null = null

  try {
    browser = await getBrowser()
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      locale: 'en-US',
      timezoneId: 'America/New_York',
    })

    // Minimal stealth — suppress automation detection
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
    })

    const page = await context.newPage()

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 })

      // Wait for at least one KPI element to appear
      await page.waitForSelector(KPI_SELECTORS.downloads, { timeout: 15_000 })

      const rawDownloads = await page.$eval(
        KPI_SELECTORS.downloads,
        (el) => el.textContent?.trim() ?? null,
      ).catch(() => null)

      const rawRevenue = await page.$eval(
        KPI_SELECTORS.revenue,
        (el) => el.textContent?.trim() ?? null,
      ).catch(() => null)

      const downloads = parseKpi(rawDownloads)
      const revenue   = parseKpi(rawRevenue)

      return { ok: true, downloads, revenue }
    } finally {
      await page.close().catch(() => {})
      await context.close().catch(() => {})
    }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    console.error('[marketData] scrape failed', appStoreId, error)
    return { ok: false, downloads: null, revenue: null, error }
  } finally {
    releaseSlot()
  }
}
