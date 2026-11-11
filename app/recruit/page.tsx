import type { Metadata } from 'next'
import Link from 'next/link'
import { RecruitNav, RecruitSparkles } from '@/components/recruit/RecruitChrome'
import { STORE } from '@/lib/seo/site'

export const metadata: Metadata = {
  title: '求人のご案内 | アイドル学園',
  description:
    'アイドル学園の求人総合ページ。キャスト求人とスタッフ求人から、あなたに合う働き方をお選びください。',
}

export default function RecruitHubPage() {
  return (
    <main className="pb-24">
      <RecruitNav />

      <section className="relative overflow-hidden px-4 pb-10 pt-14">
        <RecruitSparkles />
        <div className="relative mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-bold tracking-[0.45em] text-pink-400">RECRUIT</p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-wide text-[var(--recruit-rose)] md:text-5xl">
            アイドル学園
          </h1>
          <p className="mt-3 text-base font-bold tracking-[0.2em] text-pink-500/90">求人のご案内</p>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-[var(--recruit-muted)]">
            華やかに輝くキャストも、学園を支えるスタッフも募集中。
            <br />
            かわいいが正義の空気感で、一緒に働きませんか。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl space-y-4 px-4">
        <Link
          href="/recruit/cast"
          className="group recruit-float block overflow-hidden rounded-[1.75rem] border border-pink-200/80 bg-white/80 p-6 shadow-[0_18px_50px_rgba(255,77,141,0.15)] backdrop-blur transition-transform hover:-translate-y-1"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.35em] text-pink-400">CAST</p>
              <h2 className="mt-2 text-2xl font-extrabold text-[var(--recruit-rose-deep)]">
                キャスト求人
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--recruit-muted)]">
                制服・コスプレでキラキラ活動。未経験歓迎・日払い・送迎あり。
                {STORE.area}エリアでアイドルデビュー。
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 px-3 py-1 text-[11px] font-extrabold text-white shadow-md">
              人気
            </span>
          </div>
          <p className="mt-5 text-sm font-extrabold text-[var(--recruit-rose)] group-hover:underline">
            入学案内を見る →
          </p>
        </Link>

        <Link
          href="/recruit/staff"
          className="group block overflow-hidden rounded-[1.75rem] border border-amber-200/80 bg-white/80 p-6 shadow-[0_18px_50px_rgba(245,200,76,0.18)] backdrop-blur transition-transform hover:-translate-y-1"
          style={{ animationDelay: '0.4s' }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.35em] text-amber-500">STAFF</p>
              <h2 className="mt-2 text-2xl font-extrabold text-rose-900">スタッフ求人</h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--recruit-muted)]">
                ドライバー・受付・事務など。かわいい現場を支える側で活躍できます。
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 px-3 py-1 text-[11px] font-extrabold text-rose-950 shadow-md">
              募集中
            </span>
          </div>
          <p className="mt-5 text-sm font-extrabold text-amber-600 group-hover:underline">
            スタッフ案内を見る →
          </p>
        </Link>
      </section>

      <p className="mx-auto mt-10 max-w-2xl px-4 text-center text-[11px] leading-relaxed text-pink-400/90">
        ※在籍は{STORE.brand}ポリシーに基づき、18歳以上（高校生在籍不可）です。
      </p>
    </main>
  )
}
