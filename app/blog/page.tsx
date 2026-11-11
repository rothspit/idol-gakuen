import Link from 'next/link'
import type { Metadata } from 'next'
import { listGuideArticles } from '@/lib/articles-server'
import { SITE_URL, STORE } from '@/lib/seo/site'

export const metadata: Metadata = {
  title: `ブログ｜${STORE.brand}`,
  description: `${STORE.brand}の公式ブログ。船橋エリアのデリヘル案内やお役立ち記事を公開します。`,
  alternates: { canonical: `${SITE_URL}/blog` },
}

export default function BlogIndexPage() {
  const articles = listGuideArticles()

  return (
    <main className="min-h-screen bg-white text-slate-900 pb-24">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-pink-100 px-4 py-3 flex justify-between items-center">
        <Link href="/funabashi" className="text-pink-600 font-bold text-sm">
          ← {STORE.brand}
        </Link>
        <Link
          href="/funabashi/reserve"
          className="bg-pink-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full"
        >
          WEB予約
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <p className="text-pink-500 text-xs font-bold tracking-[0.3em] mb-2">BLOG</p>
        <h1 className="text-2xl font-black mb-3">お役立ちブログ</h1>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          Search Console や編集部が選定したテーマの記事です。公開は人手ファクトチェック後のみ。
          エリア固定ガイドは <Link href="/funabashi/guide" className="text-pink-600 underline">船橋ガイド</Link> もご覧ください。
        </p>

        {articles.length === 0 ? (
          <p className="text-sm text-slate-400">
            公開中のブログ記事はまだありません。下書きは編集部が精査したうえで順次公開します。
          </p>
        ) : (
          <ul className="grid gap-4">
            {articles.map((a) => (
              <li key={a.slug} className="rounded-2xl border border-pink-100 bg-pink-50/40 p-5">
                <Link href={a.href} className="block">
                  <h2 className="font-bold text-slate-900 leading-relaxed hover:text-pink-600">{a.title}</h2>
                  {a.description && (
                    <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-2">{a.description}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
