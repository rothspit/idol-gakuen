import { NextRequest, NextResponse } from 'next/server'
import { adminUnauthorizedResponse, verifyAdminBasicAuth } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  if (!verifyAdminBasicAuth(req)) return adminUnauthorizedResponse()

  const { sessionId } = await params
  if (!sessionId) {
    return NextResponse.json({ error: 'session_id が必要です' }, { status: 400 })
  }

  try {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('session_id', sessionId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('admin chat delete:', e)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}
