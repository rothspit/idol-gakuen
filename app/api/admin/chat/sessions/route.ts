import { NextRequest, NextResponse } from 'next/server'
import { adminUnauthorizedResponse, verifyAdminBasicAuth } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  if (!verifyAdminBasicAuth(req)) return adminUnauthorizedResponse()

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const uniqueSessions = new Map<string, (typeof data)[0]>()
    for (const msg of data ?? []) {
      if (!uniqueSessions.has(msg.session_id)) {
        uniqueSessions.set(msg.session_id, msg)
      }
    }

    return NextResponse.json({ sessions: Array.from(uniqueSessions.values()) })
  } catch (e) {
    console.error('admin chat sessions:', e)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}
