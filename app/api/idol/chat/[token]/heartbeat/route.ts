import { NextRequest, NextResponse } from 'next/server'
import { heartbeatIdolChat, isValidChatToken } from '@/lib/idol-staff-chat'

type Ctx = { params: Promise<{ token: string }> }

export async function POST(request: NextRequest, ctx: Ctx) {
  const { token } = await ctx.params
  if (!isValidChatToken(token)) {
    return NextResponse.json({ error: 'invalid_token' }, { status: 400 })
  }
  try {
    const body = await request.json().catch(() => ({}))
    const phone = typeof body?.phone === 'string' ? body.phone.trim() : ''
    const data = await heartbeatIdolChat(token, phone || undefined)
    return NextResponse.json(data)
  } catch (e) {
    console.error('[idol/chat/heartbeat]', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'failed' },
      { status: 404 },
    )
  }
}
