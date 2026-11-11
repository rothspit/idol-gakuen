import Link from 'next/link'
import CastImage from '@/components/CastImage'
import WaitStatusBadge from '@/components/WaitStatusBadge'
import { fetchCrmCasts, fetchCrmScheduleForDate, getImageUrl } from '@/lib/crm/idol-schedule'
import { resolveCastStatusBadge } from '@/lib/crm/wait-status'
import { getBusinessTodayString } from '@/lib/business-date'
import { IDOL_STORE_ID } from '@/lib/idol-reservation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getGirlsWithTodayStatus() {
  const today = getBusinessTodayString()
  const [casts, scheduleEntries] = await Promise.all([
    fetchCrmCasts(IDOL_STORE_ID),
    fetchCrmScheduleForDate(today, IDOL_STORE_ID),
  ])

  const waitByCastId = new Map(
    scheduleEntries.map((e) => [
      Number(e.cast_id),
      {
        wait_status: e.wait_status,
        attend_end_time: e.attend_end_time,
        status: e.status,
        is_sokudol: e.is_sokudol,
        is_new: e.is_new,
        is_debut_day: e.is_debut_day,
        is_debut_today: e.is_debut_today,
      },
    ])
  )

  return casts.map((girl) => {
    const sched = waitByCastId.get(Number(girl.id))
    return {
      ...girl,
      wait_status: sched?.wait_status,
      attend_end_time: sched?.attend_end_time ?? null,
      schedule_status: sched?.status,
      is_sokudol: sched?.is_sokudol,
      is_new: sched?.is_new ?? (girl as { is_new?: boolean }).is_new,
      is_debut_day: sched?.is_debut_day,
      is_debut_today: sched?.is_debut_today,
    }
  })
}

export default async function GirlsListPage() {
  const girls = await getGirlsWithTodayStatus()

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur text-white shadow-lg p-4 flex items-center justify-between">
        <Link href="/funabashi" className="font-bold text-lg">⬅ トップへ戻る</Link>
        <h1 className="font-bold">船橋デリヘル 在籍キャスト一覧</h1>
      </div>

      <div className="max-w-2xl mx-auto px-2 py-4">
        <p className="text-center text-xs text-slate-500 mb-4">
          気になる子がいたら、お気軽にお問い合わせください💕
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {girls.map((girl) => {
            const imageUrl = getImageUrl(girl)
            const badge = resolveCastStatusBadge({
              waitStatus: girl.wait_status,
              attendEndTime: girl.attend_end_time,
              status: girl.schedule_status || girl.status,
              isSokudol: girl.is_sokudol,
              useWaitStatus: true,
            })

            const newcomerLabel =
              girl.is_debut_today || girl.is_debut_day ? '本日初日！' : girl.is_new ? '新人' : null
            const avail = (() => {
              if (girl.is_sokudol || badge.type === 'immediate') return '即ドルOK'
              if (badge.type === 'busy') {
                const t = girl.attend_end_time?.slice(0, 5)
                return t ? `次回 ${t}〜 ご案内可` : '授業中'
              }
              if (badge.type === 'closed') return '本日終了'
              if (girl.today_hours) return girl.today_hours
              return null
            })()

            return (
              <Link
                href={`/girls/${girl.id}`}
                key={girl.id}
                className={`relative aspect-[3/4] bg-slate-200 cursor-pointer overflow-hidden group block ${
                  badge.dimCard ? 'opacity-70 grayscale' : ''
                }`}
              >
                {imageUrl ? (
                  <CastImage
                    src={imageUrl}
                    alt={girl.name}
                    fill
                    className="transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Img</div>
                )}

                {newcomerLabel ? (
                  <span className="absolute top-2 left-2 z-20 text-[10px] font-black bg-amber-400 text-white rounded-full px-2 py-0.5 shadow">
                    {newcomerLabel}
                  </span>
                ) : null}

                {badge.showBadge ? (
                  <div className="absolute top-2 right-2 z-20 pointer-events-none">
                    <WaitStatusBadge badge={badge} size="sm" variant="chip" />
                  </div>
                ) : null}

                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2 text-white opacity-90 group-hover:opacity-100 transition-opacity">
                  <div className="font-bold text-base drop-shadow-md truncate">
                    {girl.name} <span className="text-xs opacity-90 drop-shadow">({girl.age})</span>
                  </div>
                  {avail ? (
                    <div
                      className={`text-[10px] font-medium drop-shadow-md mt-0.5 truncate ${
                        girl.is_sokudol || badge.type === 'immediate' ? 'text-pink-200' : 'text-white/90'
                      }`}
                    >
                      {avail}
                    </div>
                  ) : null}
                </div>
              </Link>
            )
          })}
        </div>

        <p className="text-center text-[10px] text-slate-400 mt-8 leading-relaxed px-4">
          船橋・西船橋・津田沼のデリヘル「アイドル学園」。
          <Link href="/funabashi/guide/jk-style" className="text-pink-500 underline ml-1">
            JK・制服系をお探しの方はこちら
          </Link>
        </p>
      </div>
    </div>
  )
}
