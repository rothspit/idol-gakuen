'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import CastImage from '@/components/CastImage'
import WaitStatusBadge from '@/components/WaitStatusBadge'
import { getImageUrl, type DisplayCast } from '@/lib/crm/idol-schedule'
import { resolveCastStatusBadge } from '@/lib/crm/wait-status'
import { sortScheduleCasts } from '@/lib/crm/schedule-sort'
import { getBusinessToday, getBusinessTodayString } from '@/lib/business-date'
import { IDOL_STORE_ID } from '@/lib/idol-reservation'

type ScheduleSectionProps = {
  storeId?: number
  initialDate?: string
  initialCasts?: DisplayCast[]
}

export default function ScheduleSection({
  storeId = IDOL_STORE_ID,
  initialDate,
  initialCasts,
}: ScheduleSectionProps) {
  const businessToday = getBusinessTodayString()

  const getDates = () => {
    const datesList = []
    const week = ['日', '月', '火', '水', '木', '金', '土']
    const base = getBusinessToday()
    for (let i = 0; i < 7; i++) {
      const d = new Date(base)
      d.setDate(base.getDate() + i)
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

      let label = ''
      if (i === 0) label = '本日'
      else if (i === 1) label = '明日'
      else label = `${d.getMonth() + 1}/${d.getDate()}(${week[d.getDay()]})`

      datesList.push({ date: dateStr, label })
    }
    return datesList
  }

  const [dates] = useState(getDates())
  const [selectedDate, setSelectedDate] = useState(initialDate ?? dates[0].date)
  const skipInitialFetch = useRef(Boolean(initialCasts && initialDate))
  const [girls, setGirls] = useState<DisplayCast[]>(() =>
    initialCasts && initialDate
      ? sortScheduleCasts(initialCasts, initialDate === businessToday)
      : []
  )
  const [loading, setLoading] = useState(!(initialCasts && initialDate))
  const isTodayTab = selectedDate === businessToday

  useEffect(() => {
    async function getGirlsByDate() {
      if (skipInitialFetch.current && selectedDate === initialDate) {
        skipInitialFetch.current = false
        return
      }

      setLoading(true)
      try {
        const res = await fetch(
          `/api/idol/schedule-display?date=${selectedDate}&store_id=${storeId}`
        )
        if (!res.ok) throw new Error('Failed to fetch schedule')
        const json = await res.json()
        const list: DisplayCast[] = json.casts ?? []
        setGirls(sortScheduleCasts(list, selectedDate === businessToday))
      } catch (err) {
        console.error(err)
        setGirls([])
      } finally {
        setLoading(false)
      }
    }
    getGirlsByDate()
  }, [selectedDate, storeId, initialDate, businessToday])

  const getStatus = (girl: DisplayCast) =>
    resolveCastStatusBadge({
      waitStatus: girl.wait_status,
      attendEndTime: girl.attend_end_time,
      status: girl.status,
      isSokudol: girl.is_sokudol,
      useWaitStatus: isTodayTab,
    })

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black text-pink-600 flex items-center gap-2">
          <span className="text-2xl text-pink-400">⚡️</span> 出勤情報
        </h2>
        <span className="text-[10px] font-bold text-pink-400 bg-pink-50 px-3 py-1 rounded-full border border-pink-100" suppressHydrationWarning>
          {new Date().toLocaleDateString()} 更新
        </span>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-4 mb-2 scrollbar-hide">
        {dates.map((d) => (
          <button
            key={d.date}
            onClick={() => setSelectedDate(d.date)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border-2 transition-all flex-shrink-0 active:scale-95 ${
              selectedDate === d.date
                ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white border-transparent shadow shadow-pink-200'
                : 'bg-white text-pink-400 border-pink-100 hover:bg-pink-50'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`schedule-skeleton-${i}`}
              className="aspect-[4/5] rounded-2xl bg-pink-100/80 animate-pulse border border-pink-100"
            />
          ))
        ) : girls.length === 0 ? (
          <div className="col-span-full py-10 px-4 text-center bg-white rounded-3xl border border-pink-100 shadow-sm">
            <>
              <span className="font-bold text-lg text-pink-500">✨ 美少女たちが出勤検討中！ ✨</span>
              <br />
              <span className="text-sm mt-2 inline-block text-pink-400">
                期待の新人美少女も続々入店を控えています♡
              </span>
            </>
          </div>
        ) : (
          girls.map((girl) => {
            const status = getStatus(girl)
            const imageUrl = getImageUrl(girl)
            const avail = (() => {
              if (!isTodayTab) {
                if (girl.start_time && girl.end_time) return `${girl.start_time}〜${girl.end_time}`
                return girl.today_hours || null
              }
              if (status.dimCard && status.type === 'closed') return '本日終了'
              if (girl.is_sokudol || status.type === 'immediate') return '即ドルOK'
              if (status.type === 'busy') {
                const t = girl.attend_end_time?.slice(0, 5)
                return t ? `次回 ${t}〜 ご案内可` : '授業中'
              }
              if (girl.start_time) return `${String(girl.start_time).slice(0, 5)}〜`
              return null
            })()
            const newcomerLabel = girl.is_debut_day || girl.is_debut_today ? '本日初日！' : girl.is_new ? '新人' : null

            return (
              <Link
                href={`/girls/${girl.cast_id}`}
                key={`schedule-${girl.id}`}
                className={`block relative rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all active:scale-[0.98] aspect-[4/5] bg-pink-50 group border border-pink-100 ${
                  status.dimCard ? 'opacity-70 grayscale' : ''
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
                  <div className="w-full h-full flex items-center justify-center text-xs text-pink-300 bg-gradient-to-br from-pink-50 to-white font-bold">
                    No Image
                  </div>
                )}

                {newcomerLabel ? (
                  <span className="absolute top-2 left-2 z-20 text-[10px] font-black bg-amber-400 text-white rounded-full px-2 py-0.5 shadow">
                    {newcomerLabel}
                  </span>
                ) : null}

                {status.showBadge ? (
                  <div className="absolute top-2 right-2 z-20 pointer-events-none">
                    <WaitStatusBadge badge={status} size="sm" variant="chip" />
                  </div>
                ) : null}

                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3 z-10 transition-colors group-hover:from-black/80">
                  <div className="flex items-baseline justify-between mb-0.5 mt-auto">
                    <div className="font-black text-white text-lg drop-shadow-md truncate pr-1">{girl.name}</div>
                    {girl.age != null && (
                      <span className="text-[10px] font-bold text-pink-100 drop-shadow-md shrink-0 bg-black/30 px-1.5 py-0.5 rounded">
                        {girl.age}歳
                      </span>
                    )}
                  </div>
                  {avail ? (
                    <div
                      className={`text-[10px] truncate font-medium drop-shadow-md mt-1 border-t border-white/20 pt-1 ${
                        girl.is_sokudol || status.type === 'immediate' ? 'text-pink-200' : 'text-white/90'
                      }`}
                    >
                      {avail}
                    </div>
                  ) : null}
                </div>
              </Link>
            )
          })
        )}
      </div>

      <div className="mt-8 text-center">
        <Link href="/girls" className="inline-block bg-white text-sm font-bold text-pink-500 border-2 border-pink-200 px-8 py-3 rounded-full hover:bg-pink-50 hover:border-pink-300 transition-colors shadow-sm">
          全キャストを見る &gt;
        </Link>
      </div>
    </div>
  )
}
