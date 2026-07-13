import { parseKpi } from './parseKpi'

const KPI_SELECTORS = {
  downloads: '[aria-labelledby="app-overview-unified-kpi-downloads"]',
  revenue:   '[aria-labelledby="app-overview-unified-kpi-revenue"]',
}

// Must match @sparticuz/chromium-min version (133)
const CHROMIUM_URL =
  'https://github.com/Sparticuz/chromium/releases/download/v133.0.0/chromium-v133.0.0-pack.tar'

export interface ScrapeResult {
  ok: boolean
  downloads: number | null
  revenue: number | null
  error?: string
}

let browserPromise: Promise<import('playwright-core').Browser> | null = null

async function getBrowser(): Promise<import('playwright-core').Browser> {
  if (!browserPromise) {
    browserPromise = (async () => {
      let browser: import('playwright-core').Browser

      if (process.env.VERCEL) {
        const [{ default: chromium }, { chromium: pw }] = await Promise.all([
          import('@sparticuz/chromium-min'),
          import('playwright-core'),
        ])
        const executablePath = await chromium.executablePath(CHROMIUM_URL)
        browser = await pw.launch({
          args: chromium.args,
          executablePath,
          headless: true,
        })
      } else {
        // Local dev — use playwright's bundled Chromium
        const { chromium } = await import('playwright')
        browser = await chromium.launch({ headless: true }) as unknown as import('playwright-core').Browser
      }

      browser.on('disconnected', () => { browserPromise = null })
      return browser
    })()
  }
  return browserPromise
}

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
  if (next) next()
  else activePages--
}

export async function scrapeMarketData(
  appStoreId: string,
  country = 'US',
): Promise<ScrapeResult> {
  const url = `https://app.sensortower.com/overview/${appStoreId}?country=${country}`

  await acquireSlot()

  try {
    const browser = await getBrowser()
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
      locale: 'en-US',
      timezoneId: 'America/New_York',
    })

    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
    })

    const page = await context.newPage()

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 })
      await page.waitForSelector(KPI_SELECTORS.downloads, { timeout: 15_000 })

      const rawDownloads = await page
        .$eval(KPI_SELECTORS.downloads, (el) => el.textContent?.trim() ?? null)
        .catch(() => null)

      const rawRevenue = await page
        .$eval(KPI_SELECTORS.revenue, (el) => el.textContent?.trim() ?? null)
        .catch(() => null)

      return {
        ok: true,
        downloads: parseKpi(rawDownloads),
        revenue: parseKpi(rawRevenue),
      }
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
