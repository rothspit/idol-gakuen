import { createClient } from '@supabase/supabase-js'

export type ReviewRow = {
  id: string
  girl_id: number
  nickname: string
  title: string
  rating: number
  content: string
  created_at: string
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getApprovedReviews(limit = 12): Promise<ReviewRow[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, girl_id, nickname, title, rating, content, created_at')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch reviews:', error)
    return []
  }
  return data ?? []
}
