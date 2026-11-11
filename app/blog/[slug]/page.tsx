import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getGuideSlugsLive, loadGuideArticle, listGuideArticles } from '@/lib/articles-server'
import { SITE_URL, STORE } from '@/lib/seo/site'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return getGuideSlugsLive().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = loadGuideArticle(slug)
  if (!article) return { title: '記事が見つかりません' }
  const title = article.seo.title || article.title
  const description = article.seo.description || ''
  return {
    title: `${title} | ${STORE.brand}`,
    description,
    alternates: { canonical: article.seo.canonical || `${SITE_URL}/blog/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/blog/${slug}`,
      type: 'article',
      images: article.seo.ogImage ? [article.seo.ogImage] : undefined,
    },
  }
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params
  const article = loadGuideArticle(slug)
  if (!article) notFound()

  const title = article.seo.title || article.title
  const related = listGuideArticles().filter((a) => a.slug !== slug)

  return (
    <main className="min-h-screen bg-white text-slate-900 pb-24">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-pink-100 px-4 py-3 flex justify-between items-center">
        <Link href="/blog" className="text-pink-600 font-bold text-sm">
          ← ブログ一覧
        </Link>
        <Link
          href="/funabashi/reserve"
          className="bg-pink-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full"
        >
          WEB予約
        </Link>
      </header>

      <article className="max-w-2xl mx-auto px-4 py-10">
        <p className="text-xs text-slate-400 mb-3">{article.publishedAt || article.updatedAt}</p>
        <h1 className="text-2xl font-black leading-relaxed mb-8">{title}</h1>
        <div
          className="prose prose-slate max-w-none
            prose-a:text-pink-600 prose-headings:text-slate-900
            prose-p:leading-8"
          dangerouslySetInnerHTML={{ __html: article.html }}
        />

        {related.length > 0 && (
          <aside className="mt-12 border-t border-pink-100 pt-8">
            <p className="text-xs font-bold tracking-wider text-pink-500 mb-3">関連記事</p>
            <ul className="space-y-2 text-sm">
              {related.map((a) => (
                <li key={a.slug}>
                  <Link href={a.href} className="font-bold hover:text-pink-600">
                    → {a.title}
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
