import { NextRequest, NextResponse } from 'next/server'
import { IDOL_DEFAULT_STORE_CODE, startIdolChat } from '@/lib/idol-staff-chat'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const storeCode =
      typeof body?.store_code === 'string' && body.store_code.trim()
        ? body.store_code.trim()
        : IDOL_DEFAULT_STORE_CODE
    const phone = typeof body?.phone === 'string' ? body.phone.trim() : ''
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const source =
      typeof body?.source === 'string' &&
      ['guest', 'recruit', 'staff_recruit'].includes(body.source)
        ? (body.source as 'guest' | 'recruit' | 'staff_recruit')
        : undefined

    const data = await startIdolChat({
      store_code: storeCode,
      ...(phone ? { phone } : {}),
      ...(name ? { name } : {}),
      source,
    })
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    console.error('[idol/chat/start]', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'failed' },
      { status: 400 },
    )
  }
}
