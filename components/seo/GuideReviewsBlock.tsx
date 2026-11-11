import Link from 'next/link'
import type { ReviewRow } from '@/lib/seo/reviews'

export default function GuideReviewsBlock({ reviews }: { reviews: ReviewRow[] }) {
  if (reviews.length === 0) {
    return (
      <section className="mt-8 bg-pink-50 rounded-xl p-5 border border-pink-100">
        <h2 className="font-black text-slate-800 text-base mb-2">📝 お客様の口コミ</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          まだ口コミの投稿がありません。ご利用後、キャストのプロフィールページから口コミを投稿いただけると助かります。
        </p>
        <Link
          href="/girls"
          className="inline-block mt-3 text-sm font-bold text-pink-600 underline"
        >
          キャスト一覧を見る
        </Link>
      </section>
    )
  }

  return (
    <section className="mt-8">
      <h2 className="font-black text-slate-800 text-base mb-4">📝 お客様の口コミ（最新）</h2>
      <div className="space-y-3">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-yellow-500 text-sm">
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)}
                </span>
                {review.title ? (
                  <h3 className="font-bold text-slate-800 text-sm mt-1">{review.title}</h3>
                ) : null}
              </div>
              <time className="text-[10px] text-slate-400 shrink-0 ml-2">
                {new Date(review.created_at).toLocaleDateString('ja-JP')}
              </time>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {review.content}
            </p>
            <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
              <span>— {review.nickname}</span>
              <Link
                href={`/girls/${review.girl_id}`}
                className="text-pink-600 font-bold hover:underline"
              >
                キャストを見る →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
