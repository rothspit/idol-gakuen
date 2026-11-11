import type { Metadata } from 'next'
import Link from 'next/link'
import { RecruitCta, RecruitNav, RecruitSparkles } from '@/components/recruit/RecruitChrome'
import {
  CAST_FLOW,
  CAST_HIGHLIGHTS,
  RECRUIT_AGE,
  RECRUIT_LINE,
  RECRUIT_PHONE,
  RECRUIT_PHONE_TEL,
} from '@/lib/recruit'
import { STORE } from '@/lib/seo/site'

export const metadata: Metadata = {
  title: 'キャスト求人 | アイドル学園',
  description:
    '船橋エリア「アイドル学園」のキャスト求人。未経験歓迎・日払い・送迎あり。かわいく輝ける制服・コスプレ派遣です。',
}

export default function CastRecruitPage() {
  return (
    <main className="pb-28">
      <RecruitNav
        trailing={
          <Link
            href="/recruit/staff"
            className="hidden text-[10px] font-bold text-amber-600 underline underline-offset-2 sm:inline"
          >
            スタッフ求人
          </Link>
        }
      />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-12 pt-12">
        <RecruitSparkles />
        <div className="relative mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-bold tracking-[0.45em] text-pink-400">CAST RECRUIT</p>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight text-[var(--recruit-rose)] md:text-5xl">
            かわいいが、
            <br />
            <span className="bg-gradient-to-r from-[#ff7aa2] via-[#ff4d8d] to-[#f5c84c] bg-clip-text text-transparent">
              正義。
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-[var(--recruit-muted)]">
            {STORE.brand}で、制服・コスプレのアイドル活動を始めませんか。
            <br />
            未経験でも大丈夫。華やかに、自分らしく輝ける環境です。
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/80 px-4 py-2 text-[12px] font-bold text-pink-500 shadow-sm">
            <span className="text-[var(--recruit-gold)]">✦</span>
            日給3万円〜も目指せる / オンライン面談OK
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <RecruitCta href={RECRUIT_LINE} variant="line" external>
              LINEでかんたん応募
            </RecruitCta>
            <RecruitCta href={`tel:${RECRUIT_PHONE_TEL}`} variant="ghost">
              ☎ {RECRUIT_PHONE}
            </RecruitCta>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6 text-center">
          <p className="text-[10px] font-bold tracking-[0.4em] text-pink-400">WHY IDOL</p>
          <h2 className="mt-2 text-xl font-extrabold text-[var(--recruit-rose-deep)]">
            選ばれる理由
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {CAST_HIGHLIGHTS.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-pink-100 bg-white/85 p-5 shadow-[0_10px_30px_rgba(255,77,141,0.08)]"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-50 text-sm text-[var(--recruit-rose)]">
                  {item.mark}
                </span>
                <h3 className="font-extrabold text-[var(--recruit-ink)]">{item.title}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--recruit-muted)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Requirements */}
      <section className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6 text-center">
          <p className="text-[10px] font-bold tracking-[0.4em] text-pink-400">DETAILS</p>
          <h2 className="mt-2 text-xl font-extrabold text-[var(--recruit-rose-deep)]">募集要項</h2>
        </div>
        <div className="overflow-hidden rounded-2xl border border-pink-100 bg-white/90 shadow-[0_10px_30px_rgba(255,77,141,0.08)]">
          <dl className="divide-y divide-pink-50">
            {[
              ['職種', 'デリヘル・制服コスプレ（派遣キャスト）'],
              ['応募資格', RECRUIT_AGE + ' / 未経験大歓迎'],
              ['給与', 'バック率 60%〜75% ※各種ボーナスあり'],
              ['時間', '11:00〜翌3:00（週1・3時間〜OK）'],
              ['勤務地', `${STORE.area}エリア（西船橋・船橋・津田沼ほか）`],
              ['待遇', '日払い / 完全送迎 / 衣装・メイク貸出'],
            ].map(([label, value]) => (
              <div key={label} className="grid grid-cols-3 gap-3 px-5 py-4">
                <dt className="text-[12px] font-bold text-pink-400">{label}</dt>
                <dd className="col-span-2 text-sm font-medium text-[var(--recruit-ink)]">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-pink-400/90">
          ※詳細条件はご希望や経験によりご案内します。無理な引き止めはありません。
        </p>
      </section>

      {/* Flow */}
      <section className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6 text-center">
          <p className="text-[10px] font-bold tracking-[0.4em] text-pink-400">FLOW</p>
          <h2 className="mt-2 text-xl font-extrabold text-[var(--recruit-rose-deep)]">
            応募の流れ
          </h2>
        </div>
        <ol className="space-y-3">
          {CAST_FLOW.map((step, index) => (
            <li
              key={step.title}
              className="rounded-2xl border border-pink-100 bg-white/85 p-5 shadow-[0_8px_24px_rgba(255,77,141,0.06)]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-sm font-extrabold text-white">
                  {index + 1}
                </span>
                <p className="font-extrabold text-[var(--recruit-ink)]">{step.title}</p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--recruit-muted)]">{step.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-2xl px-4 pb-8 pt-6 text-center">
        <div className="rounded-[1.75rem] border border-pink-200 bg-gradient-to-br from-white via-pink-50 to-amber-50 px-6 py-10 shadow-[0_18px_50px_rgba(255,77,141,0.12)]">
          <p className="text-lg font-extrabold text-[var(--recruit-rose-deep)]">
            まずは気軽に相談してね
          </p>
          <p className="mt-2 text-sm text-[var(--recruit-muted)]">
            「短時間だけ」「未経験で不安」も大歓迎です。
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <RecruitCta href={RECRUIT_LINE} variant="line" external>
              LINEで応募する
            </RecruitCta>
            <a
              href={`tel:${RECRUIT_PHONE_TEL}`}
              className="text-sm font-bold text-[var(--recruit-rose)] underline underline-offset-4"
            >
              ☎ {RECRUIT_PHONE}
            </a>
          </div>
          <div className="mt-6 space-y-2 text-sm">
            <div>
              <Link href="/recruit/staff" className="font-bold text-amber-600 underline">
                スタッフ求人はこちら
              </Link>
            </div>
            <div>
              <Link href="/recruit" className="font-bold text-pink-400 underline">
                求人トップへ戻る
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
