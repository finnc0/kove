/**
 * Parse compact KPI strings into raw numbers.
 * Examples: "500K" → 500_000, "$2M" → 2_000_000, "<5K" → 5_000, "—" → null
 */
export function parseKpi(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const s = raw.trim();
  if (!s || s === '—' || s === '-' || s === 'N/A') return null;

  // Strip currency symbol and leading < / ~
  const cleaned = s.replace(/[^0-9.KMBkmb]/g, '').toUpperCase();
  if (!cleaned) return null;

  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;

  if (cleaned.endsWith('B')) return Math.round(num * 1_000_000_000);
  if (cleaned.endsWith('M')) return Math.round(num * 1_000_000);
  if (cleaned.endsWith('K')) return Math.round(num * 1_000);
  return Math.round(num);
}
