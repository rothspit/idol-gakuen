import { createClient, SupabaseClient } from '@supabase/supabase-js'

// =============================================
// アイドル学園専用 Supabase設定
// THE TIARAは lib/supabase-tiara.ts を使用
// =============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// シングルトンインスタンス
let supabaseInstance: SupabaseClient | null = null

// クライアント取得（ブラウザ・サーバー共用）
export const getSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  }
  return supabaseInstance
}

// 直接エクスポート（後方互換性）
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 予約データの型定義
export interface Booking {
  id: string
  user_name: string
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
    adjust_minutes?: number
  }
  use_points: boolean
  cast_id?: string
  notes?: string
  created_at: string
  updated_at: string
}

// ステータスの日本語ラベル
export const statusLabels: Record<Booking['status'], string> = {
  pending: '保留中',
  confirmed: '確定',
  negotiating: '調整中',
  rejected: 'お断り',
  cancelled: 'キャンセル',
}

// ステータスの色
export const statusColors: Record<Booking['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  negotiating: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
}
