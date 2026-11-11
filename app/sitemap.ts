import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { getGuideSlugs } from '@/lib/seo/funabashi'
import { SITE_URL } from '@/lib/seo/site'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CRM_BASE = process.env.NEXT_PUBLIC_CRM_API_URL || 'https://crm.h-mitsu.com/api'

async function getCasts() {
  try {
    const res = await fetch(`${CRM_BASE}/idol/casts?store_id=2`, { cache: 'no-store' })
    if (!res.ok) return []
    const json = await res.json()
    return json.casts || []
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: idolBrand } = await supabase
    .from('brands')
    .select('id')
    .eq('slug', 'idol-gakuen')
    .single()

  const { data: idolDiaries } = await supabase
    .from('diaries')
    .select('id, created_at')
    .eq('brand_id', idolBrand?.id ?? '')

  const casts = await getCasts()

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/funabashi`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/funabashi/guide`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
    { url: `${SITE_URL}/girls`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/recruit`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/recruit/cast`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.55 },
    { url: `${SITE_URL}/recruit/staff`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.45 },
    { url: `${SITE_URL}/movies`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/diaries`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
  ]

  const guidePages: MetadataRoute.Sitemap = getGuideSlugs().map((slug) => ({
    url: `${SITE_URL}/funabashi/guide/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: ['jk-style', 'price', 'hotel', 'ranking', 'reviews'].includes(slug) ? 0.88 : 0.8,
  }))

  const castPages: MetadataRoute.Sitemap = casts.map((cast: { id: number; updated_at?: string }) => ({
    url: `${SITE_URL}/girls/${cast.id}`,
    lastModified: cast.updated_at ? new Date(cast.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }))

  const idolDiaryPages: MetadataRoute.Sitemap = (idolDiaries ?? []).map((d) => ({
    url: `${SITE_URL}/diaries/${d.id}`,
    lastModified: d.created_at ? new Date(d.created_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...guidePages, ...castPages, ...idolDiaryPages]
}
