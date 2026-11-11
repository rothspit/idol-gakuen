import { createClient, SupabaseClient } from '@supabase/supabase-js'

// THE TIARA専用 Supabase設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_TIARA || 'https://kkkfmwlrdyhzhbjnoerw.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_TIARA || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtra2Ztd2xyZHloemhiam5vZXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3OTkwMjgsImV4cCI6MjA4NjM3NTAyOH0.yDbDebT2hvK-N6VSOa4G0M11NM5PyJbi4bWEAVD03FU'

// シングルトンインスタンス
let supabaseTiaraInstance: SupabaseClient | null = null

// クライアント取得
export const getSupabaseTiara = (): SupabaseClient => {
  if (!supabaseTiaraInstance) {
    supabaseTiaraInstance = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  }
  return supabaseTiaraInstance
}

// 直接エクスポート
export const supabaseTiara = createClient(supabaseUrl, supabaseAnonKey)

// THE TIARA用の予約データ型
export interface TiaraBooking {
  id: string
  therapist_name: string      // セラピスト名
  course_minutes: number
  course_name?: string
  course_price?: number
  requested_time: string
  phone_number: string
  status: 'pending' | 'confirmed' | 'negotiating' | 'rejected' | 'cancelled'
  proposal_data?: {
    new_time?: string
    original_time?: string
    message?: string
    proposed_at?: string
  }
  notes?: string
  created_at: string
  updated_at: string
}

// ステータスラベル
export const tiaraStatusLabels: Record<TiaraBooking['status'], string> = {
  pending: '確認中',
  confirmed: '確定',
  negotiating: '調整中',
  rejected: 'お断り',
  cancelled: 'キャンセル',
}
