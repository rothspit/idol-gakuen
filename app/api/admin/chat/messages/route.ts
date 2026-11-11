import { NextRequest, NextResponse } from 'next/server'
import { adminUnauthorizedResponse, verifyAdminBasicAuth } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  if (!verifyAdminBasicAuth(req)) return adminUnauthorizedResponse()

  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (!sessionId) {
    return NextResponse.json({ error: 'session_id が必要です' }, { status: 400 })
  }

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ messages: data ?? [] })
  } catch (e) {
    console.error('admin chat messages GET:', e)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!verifyAdminBasicAuth(req)) return adminUnauthorizedResponse()

  try {
    const body = await req.json()
    const sessionId = typeof body.session_id === 'string' ? body.session_id : ''
    const content = typeof body.content === 'string' ? body.content.trim() : ''

    if (!sessionId || !content) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('messages')
      .insert({
        session_id: sessionId,
        content,
        sender: 'admin',
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: data })
  } catch (e) {
    console.error('admin chat messages POST:', e)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}
