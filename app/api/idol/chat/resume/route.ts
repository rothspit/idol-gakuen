import { NextRequest, NextResponse } from 'next/server'
import { resumeIdolChat } from '@/lib/idol-staff-chat'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const phone = typeof body?.phone === 'string' ? body.phone.trim() : ''
    if (!phone) {
      return NextResponse.json({ error: 'phone_required' }, { status: 400 })
    }
    const source =
      typeof body?.source === 'string' &&
      ['guest', 'recruit', 'staff_recruit'].includes(body.source)
        ? (body.source as 'guest' | 'recruit' | 'staff_recruit')
        : undefined

    const data = await resumeIdolChat({ phone, source })
    return NextResponse.json(data)
  } catch (e) {
    const status =
      e && typeof e === 'object' && 'status' in e && typeof (e as { status: unknown }).status === 'number'
        ? (e as { status: number }).status
        : 400
    console.error('[idol/chat/resume]', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'failed' },
      { status },
    )
  }
}
