import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import GuideRankingBlock from '@/components/seo/GuideRankingBlock'
import GuideReviewsBlock from '@/components/seo/GuideReviewsBlock'
import {
  GUIDE_PAGES,
  type GuideSlug,
  getGuideSlugs,
} from '@/lib/seo/funabashi'
import { getApprovedReviews } from '@/lib/seo/reviews'
import { SITE_URL, STORE } from '@/lib/seo/site'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getGuideSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = GUIDE_PAGES[slug as GuideSlug]
  if (!page) return {}

  const title = `${page.title} | ${STORE.brand}`
  return {
    title,
    description: page.metaDescription,
    keywords: page.keywords,
    openGraph: {
      title,
      description: page.metaDescription,
      url: `${SITE_URL}/funabashi/guide/${slug}`,
      type: 'article',
      locale: 'ja_JP',
    },
    alternates: {
      canonical: `${SITE_URL}/funabashi/guide/${slug}`,
    },
  }
}

export default async function GuideAreaPage({ params }: Props) {
  const { slug } = await params
  const page = GUIDE_PAGES[slug as GuideSlug]
  if (!page) notFound()

  const reviews =
    slug === 'reviews' || slug === 'ranking'
      ? await getApprovedReviews(slug === 'ranking' ? 6 : 6)
      : []

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.h1,
    description: page.metaDescription,
    url: `${SITE_URL}/funabashi/guide/${slug}`,
    author: { '@type': 'Organization', name: STORE.name },
    publisher: {
      '@type': 'Organization',
      name: STORE.name,
      url: `${SITE_URL}/funabashi`,
    },
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <div className="sticky top-0 z-40 bg-white border-b border-pink-100 px-4 py-3 flex justify-between items-center">
        <Link href="/funabashi/guide" className="text-pink-600 font-bold text-sm">
          ← ガイド一覧
        </Link>
        <Link
          href="/funabashi/reserve"
          className="bg-pink-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full"
        >
          予約する
        </Link>
      </div>

      <article className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-[10px] font-bold text-pink-400 mb-2 tracking-wider">
          {STORE.name} 公式ガイド
        </p>
        <h1 className="text-xl font-black text-slate-800 mb-4 leading-snug">{page.h1}</h1>
        <p className="text-sm text-slate-600 leading-relaxed mb-8">{page.lead}</p>

        {slug === 'ranking' && <GuideRankingBlock />}
        {slug === 'reviews' && <GuideReviewsBlock reviews={reviews} />}

        <div className="space-y-8">
          {page.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-black text-slate-800 text-base mb-2 border-l-4 border-pink-400 pl-3">
                {section.heading}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>

        {slug === 'ranking' && reviews.length > 0 && (
          <div className="mt-8">
            <GuideReviewsBlock reviews={reviews} />
          </div>
        )}
        {slug === 'reviews' && <GuideRankingBlock />}

        <div className="mt-10 flex flex-col gap-3">
          <Link
            href="/funabashi"
            className="block w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black py-3.5 rounded-2xl text-center shadow-lg"
          >
            出勤情報・キャストを見る
          </Link>
          {slug === 'price' && (
            <Link
              href="/funabashi#price"
              className="block w-full bg-white border-2 border-pink-300 text-pink-600 font-bold py-3 rounded-2xl text-center"
            >
              サイト上の料金表を見る
            </Link>
          )}
          <a
            href={`tel:${STORE.phoneTel}`}
            className="block w-full bg-white border-2 border-pink-200 text-pink-600 font-bold py-3 rounded-2xl text-center"
          >
            電話で問い合わせ {STORE.phone}
          </a>
        </div>

        {page.relatedSlugs.length > 0 && (
          <aside className="mt-10 pt-8 border-t border-slate-200">
            <h3 className="font-bold text-slate-800 text-sm mb-3">関連ガイド</h3>
            <ul className="space-y-2">
              {page.relatedSlugs.map((related) => (
                <li key={related}>
                  <Link
                    href={`/funabashi/guide/${related}`}
                    className="text-sm text-pink-600 font-bold hover:underline"
                  >
                    {GUIDE_PAGES[related].title}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </article>
    </main>
  )
}
