import { NextResponse } from 'next/server'
import { ensureChatSessionId } from '@/lib/chat-session'

export async function POST() {
  try {
    const sessionId = await ensureChatSessionId()
    return NextResponse.json({ sessionId })
  } catch (e) {
    console.error('chat session error:', e)
    return NextResponse.json({ error: 'セッションの作成に失敗しました' }, { status: 500 })
  }
}
