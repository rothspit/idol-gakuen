import type { Metadata } from 'next'
import Link from 'next/link'
import { RecruitCta, RecruitNav, RecruitSparkles } from '@/components/recruit/RecruitChrome'
import {
  RECRUIT_LINE,
  RECRUIT_PHONE,
  RECRUIT_PHONE_TEL,
  STAFF_HIGHLIGHTS,
  STAFF_ROLES,
} from '@/lib/recruit'
import { STORE } from '@/lib/seo/site'

export const metadata: Metadata = {
  title: 'スタッフ求人 | アイドル学園',
  description:
    '船橋エリア「アイドル学園」の店舗運営スタッフ（ドライバー・受付・事務など）を募集しています。キャスト求人とは別枠です。',
}

export default function StaffRecruitPage() {
  return (
    <main className="pb-28">
      <RecruitNav
        trailing={
          <Link
            href="/recruit/cast"
            className="hidden text-[10px] font-bold text-[var(--recruit-rose)] underline underline-offset-2 sm:inline"
          >
            キャスト求人
          </Link>
        }
      />

      <section className="relative overflow-hidden px-4 pb-12 pt-12">
        <RecruitSparkles />
        <div className="relative mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-bold tracking-[0.45em] text-amber-500">STAFF RECRUIT</p>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight text-rose-900 md:text-4xl">
            かわいい現場を、
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
              支える側へ。
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-[var(--recruit-muted)]">
            ドライバー・受付・事務など、{STORE.brand}の運営スタッフを募集しています。
            <br />
            <span className="text-xs text-pink-400">※キャスト（派遣）求人とは別の募集です</span>
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <RecruitCta href={RECRUIT_LINE} variant="line" external>
              LINEで応募・相談
            </RecruitCta>
            <RecruitCta href={`tel:${RECRUIT_PHONE_TEL}`} variant="ghost">
              ☎ {RECRUIT_PHONE}
            </RecruitCta>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 text-center">
          <p className="text-[10px] font-bold tracking-[0.4em] text-amber-500">WHY STAFF</p>
          <h2 className="mt-2 text-xl font-extrabold text-rose-900">働くメリット</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {STAFF_HIGHLIGHTS.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-amber-100 bg-white/85 p-5 text-center shadow-[0_10px_30px_rgba(245,200,76,0.1)]"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                {item.mark}
              </span>
              <h3 className="mt-3 font-extrabold text-[var(--recruit-ink)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--recruit-muted)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 text-center">
          <p className="text-[10px] font-bold tracking-[0.4em] text-amber-500">OPEN ROLES</p>
          <h2 className="mt-2 text-xl font-extrabold text-rose-900">募集職種</h2>
          <p className="mt-2 text-sm text-[var(--recruit-muted)]">
            詳細はLINEまたはお電話でご案内します。
          </p>
        </div>
        <ul className="space-y-3">
          {STAFF_ROLES.map((role) => (
            <li
              key={role.title}
              className="rounded-2xl border border-amber-100 bg-white/90 p-5 shadow-[0_8px_24px_rgba(245,200,76,0.08)]"
            >
              <h3 className="font-extrabold text-rose-900">{role.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--recruit-muted)]">{role.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 text-center">
          <p className="text-[10px] font-bold tracking-[0.4em] text-amber-500">DETAILS</p>
          <h2 className="mt-2 text-xl font-extrabold text-rose-900">募集要項（目安）</h2>
        </div>
        <div className="overflow-hidden rounded-2xl border border-amber-100 bg-white/90 shadow-[0_10px_30px_rgba(245,200,76,0.08)]">
          <dl className="divide-y divide-amber-50">
            {[
              ['職種', '店舗運営スタッフ（上記いずれか）'],
              ['勤務地', `${STORE.area}エリア（詳細は応募時にご案内）`],
              ['資格', '18歳以上 ※ドライバーは要普通自動車免許'],
              ['給与', '経験・ポジションにより応相談'],
              ['時間', 'シフト制（面談時にご相談）'],
            ].map(([label, value]) => (
              <div key={label} className="grid grid-cols-3 gap-3 px-5 py-4">
                <dt className="text-[12px] font-bold text-amber-500">{label}</dt>
                <dd className="col-span-2 text-sm font-medium text-[var(--recruit-ink)]">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 pb-8 pt-4 text-center">
        <div className="rounded-[1.75rem] border border-amber-200 bg-gradient-to-br from-white via-amber-50 to-pink-50 px-6 py-10 shadow-[0_18px_50px_rgba(245,200,76,0.14)]">
          <p className="text-lg font-extrabold text-rose-900">一緒に学園を盛り上げませんか</p>
          <p className="mt-2 text-sm text-[var(--recruit-muted)]">
            未経験の方も、まずはお気軽にご連絡ください。
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <RecruitCta href={RECRUIT_LINE} variant="line" external>
              LINEで応募する
            </RecruitCta>
            <a
              href={`tel:${RECRUIT_PHONE_TEL}`}
              className="text-sm font-bold text-amber-600 underline underline-offset-4"
            >
              ☎ {RECRUIT_PHONE}
            </a>
          </div>
          <div className="mt-6 space-y-2 text-sm">
            <div>
              <Link href="/recruit/cast" className="font-bold text-[var(--recruit-rose)] underline">
                キャスト求人はこちら
              </Link>
            </div>
            <div>
              <Link href="/recruit" className="font-bold text-amber-500 underline">
                求人トップへ戻る
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
