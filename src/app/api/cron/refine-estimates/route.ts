import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Estimate refinement is no longer used — live market data is fetched on analysis.
export async function GET() {
  return NextResponse.json({ skipped: true })
}
