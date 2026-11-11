import { NextRequest, NextResponse } from 'next/server'
import { getChatSessionId } from '@/lib/chat-session'

export async function POST(request: NextRequest) {
  try {
    const cookieSession = await getChatSessionId()
    const body = await request.json()
    const message = typeof body.message === 'string' ? body.message : ''
    const clientSessionId =
      typeof body.sessionId === 'string' ? body.sessionId : ''

    if (!message.trim()) {
      return NextResponse.json({ error: 'empty message' }, { status: 400 })
    }

    if (clientSessionId && cookieSession && clientSessionId !== cookieSession) {
      return NextResponse.json({ error: 'invalid session' }, { status: 403 })
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL
    const sessionLabel = cookieSession?.slice(0, 8) ?? 'unknown'

    const content = `💬 **チャット受付**\nセッション: \`${sessionLabel}…\`\n\n${message}`

    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
    } else {
      console.log('=== チャット通知（Discord未設定）===\n', content)
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('notify error:', e)
    return NextResponse.json({ error: '通知エラー' }, { status: 500 })
  }
}
