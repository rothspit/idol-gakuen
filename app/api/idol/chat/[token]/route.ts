import { NextRequest, NextResponse } from 'next/server'
import { fetchIdolChat, isValidChatToken } from '@/lib/idol-staff-chat'

type Ctx = { params: Promise<{ token: string }> }

export async function GET(request: NextRequest, ctx: Ctx) {
  const { token } = await ctx.params
  if (!isValidChatToken(token)) {
    return NextResponse.json({ error: 'invalid_token' }, { status: 400 })
  }
  try {
    const phone = request.nextUrl.searchParams.get('phone') || undefined
    const data = await fetchIdolChat(token, phone)
    return NextResponse.json(data)
  } catch (e) {
    const status =
      e && typeof e === 'object' && 'status' in e && typeof (e as { status: unknown }).status === 'number'
        ? (e as { status: number }).status
        : 404
    console.error('[idol/chat/token]', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'failed' },
      { status },
    )
  }
}
