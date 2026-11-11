import { headers } from 'next/headers'
import { supabase } from '@/lib/supabase'
import type { Brand, BrandSlug, BrandThemeConfig } from './brand-context'

// ============================================
// フォールバック定義
// ============================================

const FALLBACK_BRANDS: Record<BrandSlug, Brand> = {
  'idol-gakuen': {
    id: '00000000-0000-0000-0000-000000000001',
    slug: 'idol-gakuen',
    name: 'アイドル学園',
    domain: 'idol-gakuen.com',
    area: '船橋',
    site_title: 'アイドル学園｜船橋',
    site_tagline: '究極の「かわいい」をお届け',
    description: '船橋エリアNo.1のアイドル学園です。',
    theme_config: {
      colors: {
        primary: '#ec4899',
        'primary-light': '#f472b6',
        'primary-dark': '#db2777',
        secondary: '#8b5cf6',
        'secondary-light': '#a78bfa',
        'secondary-dark': '#7c3aed',
        accent: '#f59e0b',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#ffffff',
        'text-muted': '#94a3b8',
        'header-bg': '#1e293b',
        'header-text': '#ffffff',
        'footer-bg': '#0f172a',
        'footer-text': '#94a3b8',
      },
      borderRadius: { button: '9999px', card: '1rem', input: '0.75rem' },
      font: { heading: "'Noto Sans JP', sans-serif", body: "'Noto Sans JP', sans-serif" },
      style: 'pop',
    },
  },
}

const DEFAULT_SLUG: BrandSlug = 'idol-gakuen'

// ============================================
// getBrandSlug — ヘッダーからスラッグを取得（軽量版）
// ============================================

export async function getBrandSlug(forceSlug?: string): Promise<BrandSlug> {
  if (forceSlug === 'idol-gakuen') {
    return forceSlug
  }
  const h = await headers()
  const slug = h.get('x-brand-slug')
  if (slug === 'idol-gakuen') {
    return slug
  }
  return DEFAULT_SLUG
}

// ============================================
// getBrand — Supabase から Brand を取得
// ============================================

export async function getBrand(forceSlug?: string): Promise<Brand> {
  const slug = await getBrandSlug(forceSlug)

  try {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      console.warn(`[getBrand] Supabase fetch failed for "${slug}", using fallback:`, error?.message)
      return FALLBACK_BRANDS[slug] ?? FALLBACK_BRANDS[DEFAULT_SLUG]
    }

    // theme_config が JSON 文字列の場合はパース
    const themeConfig: BrandThemeConfig =
      typeof data.theme_config === 'string'
        ? JSON.parse(data.theme_config)
        : data.theme_config

    return {
      id: data.id,
      slug: data.slug,
      name: data.name,
      domain: data.domain,
      area: data.area ?? undefined,
      phone: data.phone ?? undefined,
      line_url: data.line_url ?? undefined,
      site_title: data.site_title ?? undefined,
      site_tagline: data.site_tagline ?? undefined,
      description: data.description ?? undefined,
      theme_config: themeConfig,
    } satisfies Brand
  } catch (e) {
    console.warn(`[getBrand] Unexpected error for "${slug}", using fallback:`, e)
    return FALLBACK_BRANDS[slug] ?? FALLBACK_BRANDS[DEFAULT_SLUG]
  }
}
