import type { Metadata } from 'next'
import Link from 'next/link'
import { GUIDE_PAGES, getGuideSlugs } from '@/lib/seo/funabashi'
import { SITE_URL, STORE } from '@/lib/seo/site'

export const metadata: Metadata = {
  title: '船橋デリヘル エリア別ガイド',
  description:
    '船橋・西船橋・津田沼・市川などエリア別の出張ガイド。JK・制服系をお探しの方、初心者の方向けの記事も掲載。',
  alternates: { canonical: `${SITE_URL}/funabashi/guide` },
}

export default function GuideHubPage() {
  const slugs = getGuideSlugs()

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <div className="sticky top-0 z-40 bg-white border-b border-pink-100 px-4 py-3">
        <Link href="/funabashi" className="text-pink-600 font-bold text-sm">
          ← アイドル学園トップへ
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-black text-slate-800 mb-2">
          {STORE.area}デリヘル エリア別ガイド
        </h1>
        <p className="text-sm text-slate-600 mb-8 leading-relaxed">
          お住まい・ホテルのエリアや、JK・制服系・初心者向けなど、目的別のガイドです。
        </p>

        <div className="space-y-4">
          {slugs.map((slug) => {
            const page = GUIDE_PAGES[slug]
            return (
              <Link
                key={slug}
                href={`/funabashi/guide/${slug}`}
                className="block bg-white border border-pink-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <h2 className="font-black text-pink-600 text-base mb-1">{page.title}</h2>
                <p className="text-xs text-slate-600 leading-relaxed">{page.lead}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
