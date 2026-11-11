import { NextRequest, NextResponse } from 'next/server'
import { ensureChatSessionId, getChatSessionId } from '@/lib/chat-session'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  try {
    const sessionId = await getChatSessionId()
    if (!sessionId) {
      return NextResponse.json({ messages: [] })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('messages')
      .select('id, content, sender, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('chat messages GET:', error)
      return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ messages: data ?? [] })
  } catch (e) {
    console.error('chat messages GET:', e)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = await ensureChatSessionId()
    const body = await request.json()
    const content = typeof body.content === 'string' ? body.content.trim() : ''

    if (!content || content.length > 2000) {
      return NextResponse.json({ error: 'メッセージが不正です' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('messages')
      .insert({
        session_id: sessionId,
        content,
        sender: 'user',
      })
      .select('id, content, sender, created_at')
      .single()

    if (error) {
      console.error('chat messages POST:', error)
      return NextResponse.json({ error: '送信に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ message: data })
  } catch (e) {
    console.error('chat messages POST:', e)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}
