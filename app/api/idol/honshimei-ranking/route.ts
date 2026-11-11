import { NextRequest, NextResponse } from 'next/server'
import {
  getHonshimeiRanking,
  HONSHIMEI_REVALIDATE_SECONDS,
  type HonshimeiPeriod,
} from '@/lib/crm/honshimei-ranking'

export const dynamic = 'force-dynamic'

const VALID_PERIODS = new Set<HonshimeiPeriod>(['month', 'last_month', 'week', 'all'])

export async function GET(req: NextRequest) {
  const periodParam = req.nextUrl.searchParams.get('period') ?? 'month'
  const period = VALID_PERIODS.has(periodParam as HonshimeiPeriod)
    ? (periodParam as HonshimeiPeriod)
    : 'month'

  try {
    const data = await getHonshimeiRanking({ period })
    const maxAge = period === 'month' ? 60 : HONSHIMEI_REVALIDATE_SECONDS
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=86400`,
      },
    })
  } catch {
    return NextResponse.json({ rankings: [], period })
  }
}
