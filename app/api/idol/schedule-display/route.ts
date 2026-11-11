import { NextRequest, NextResponse } from 'next/server'
import { getScheduleDisplay } from '@/lib/crm/schedule-display'
import { IDOL_STORE_ID } from '@/lib/idol-reservation'

export const revalidate = 30

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date')
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'date required (YYYY-MM-DD)' }, { status: 400 })
  }

  const storeIdParam = req.nextUrl.searchParams.get('store_id')
  const storeId = storeIdParam ? Number(storeIdParam) : IDOL_STORE_ID
  if (!Number.isFinite(storeId)) {
    return NextResponse.json({ error: 'invalid store_id' }, { status: 400 })
  }

  try {
    const casts = await getScheduleDisplay(date, storeId)
    return NextResponse.json(
      { date, casts },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    )
  } catch (err) {
    console.error('schedule-display error:', err)
    return NextResponse.json({ error: 'Failed to load schedule' }, { status: 500 })
  }
}
