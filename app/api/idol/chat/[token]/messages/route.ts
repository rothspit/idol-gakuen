import { NextRequest, NextResponse } from 'next/server'
import { isValidChatToken, sendIdolChatMessage } from '@/lib/idol-staff-chat'

type Ctx = { params: Promise<{ token: string }> }

export async function POST(request: NextRequest, ctx: Ctx) {
  const { token } = await ctx.params
  if (!isValidChatToken(token)) {
    return NextResponse.json({ error: 'invalid_token' }, { status: 400 })
  }
  try {
    const body = await request.json()
    const message = typeof body.message === 'string' ? body.message.trim() : ''
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
    if (!message) {
      return NextResponse.json({ error: 'empty' }, { status: 422 })
    }
    const data = await sendIdolChatMessage(token, message, phone || undefined)
    return NextResponse.json(data)
  } catch (e) {
    console.error('[idol/chat/messages]', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'failed' },
      { status: 400 },
    )
  }
}
