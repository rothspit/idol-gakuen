import { createClient, SupabaseClient } from '@supabase/supabase-js'

let adminClient: SupabaseClient | null = null

/** サーバー専用（service role）。クライアントに渡さないこと。 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY が未設定です')
    }
    adminClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return adminClient
}
