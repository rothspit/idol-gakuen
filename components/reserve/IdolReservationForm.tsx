'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  buildDateOptions,
  buildTimeSlotOptions,
  COURSE_OPTIONS,
  DISCOUNT_OPTIONS,
  IDOL_STORE_NAME,
  LOCATION_OPTIONS,
  NOMINATION_LABELS,
  PAYMENT_OPTIONS,
  type DiscountStick,
  type IdolReservationInput,
  type LocationKind,
  type NominationKind,
  type PaymentMethod,
} from '@/lib/idol-reservation'

type CastOption = { id: string | number; name: string }

const inputClass =
  'w-full rounded-xl border border-pink-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 shadow-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200/60'
const labelClass = 'text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block'

function addOneDay(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(d.getTime())) return isoDate
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function IdolReservationForm({ casts }: { casts: CastOption[] }) {
  const searchParams = useSearchParams()
  const dateOptions = useMemo(() => buildDateOptions(7), [])
  const timeOptions = useMemo(() => buildTimeSlotOptions(), [])

  const [phone, setPhone] = useState('')
  const [date, setDate] = useState(dateOptions[0]?.value ?? '')
  const [time, setTime] = useState('asap')
  const [courseMinutes, setCourseMinutes] = useState(COURSE_OPTIONS[0]?.durationMinutes ?? 60)
  const [nominationKind, setNominationKind] = useState<NominationKind>('free')
  const [castId, setCastId] = useState<string>('')
  const [castNameManual, setCastNameManual] = useState('')
  const [locationKind, setLocationKind] = useState<LocationKind>('hotel_business')
  const [locationDetail, setLocationDetail] = useState('')
  const [address, setAddress] = useState('')
  const [isRepeater, setIsRepeater] = useState(false)
  const [discountStick, setDiscountStick] = useState<DiscountStick>('none')
  const [discountNote, setDiscountNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [customerNote, setCustomerNote] = useState('')
  const [showKarteHint, setShowKarteHint] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  // Preselect cast from ?cast= (girls profile CTA)
  useEffect(() => {
    const castParam = searchParams.get('cast')
    if (!castParam || casts.length === 0) return
    const found = casts.find((c) => String(c.id) === castParam)
    if (found) {
      setCastId(String(found.id))
      setNominationKind('photo')
    }
  }, [searchParams, casts])

  const selectedCourse = COURSE_OPTIONS.find((c) => c.durationMinutes === courseMinutes)
  const castFromList = casts.find((c) => String(c.id) === castId)
  const resolvedCastName =
    nominationKind === 'free'
      ? null
      : (castFromList?.name || castNameManual.trim() || null)

  const showAddress = locationKind === 'home' && !isRepeater
  const showLocationDetail = locationKind !== 'home'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)

    const isNextDay = /（翌）|翌/.test(time)
    const timeClean = time.replace(/（翌）/g, '').replace(/翌/g, '').trim()
    const submitDate = isNextDay ? addOneDay(date) : date

    const payload: IdolReservationInput = {
      phone,
      date: submitDate,
      time: timeClean,
      courseMinutes,
      coursePriceYen: selectedCourse?.priceYen ?? 0,
      nominationKind,
      castId: castId || null,
      castName: resolvedCastName,
      locationKind,
      locationDetail,
      address,
      isRepeater,
      discountStick,
      discountNote,
      paymentMethod,
      customerNote,
      storeName: IDOL_STORE_NAME,
    }

    try {
      const res = await fetch('/api/crm-reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) {
        setResult({ ok: false, message: json.error || '送信に失敗しました' })
        return
      }
      setResult({
        ok: true,
        message: json.warning || json.message || 'ご予約を受け付けました',
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setResult({ ok: false, message: '通信エラーが発生しました' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {result && (
        <div
          className={`rounded-xl p-4 text-sm font-bold border ${
            result.ok
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {result.message}
        </div>
      )}

      <section className="bg-white rounded-2xl border border-pink-100 p-4 shadow-sm space-y-3">
        <h2 className="text-sm font-black text-pink-600 border-l-4 border-pink-500 pl-2">
          ご連絡先・日時
        </h2>
        <label>
          <span className={labelClass}>電話番号（必須）</span>
          <input
            type="tel"
            required
            className={inputClass}
            placeholder="09012345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label>
            <span className={labelClass}>ご希望日</span>
            <select className={inputClass} value={date} onChange={(e) => setDate(e.target.value)}>
              {dateOptions.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={labelClass}>ご希望時間</span>
            <select className={inputClass} value={time} onChange={(e) => setTime(e.target.value)}>
              <option value="asap">なるべく早め</option>
              {timeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          <span className={labelClass}>コース選択</span>
          <select
            className={inputClass}
            value={courseMinutes}
            onChange={(e) => setCourseMinutes(Number(e.target.value))}
          >
            {COURSE_OPTIONS.map((c) => (
              <option key={c.durationMinutes} value={c.durationMinutes}>
                {c.durationMinutes}分 — ¥{c.priceYen.toLocaleString()}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="bg-white rounded-2xl border border-pink-100 p-4 shadow-sm space-y-3">
        <h2 className="text-sm font-black text-pink-600 border-l-4 border-pink-500 pl-2">指名</h2>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(NOMINATION_LABELS) as NominationKind[]).map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => setNominationKind(kind)}
              className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                nominationKind === kind
                  ? 'bg-pink-500 text-white border-pink-500'
                  : 'bg-white text-slate-600 border-pink-200 hover:bg-pink-50'
              }`}
            >
              {NOMINATION_LABELS[kind]}
            </button>
          ))}
        </div>
        {nominationKind !== 'free' && (
          <div className="space-y-2 pt-1">
            <label>
              <span className={labelClass}>キャストを選択</span>
              <select
                className={inputClass}
                value={castId}
                onChange={(e) => {
                  setCastId(e.target.value)
                  const c = casts.find((x) => String(x.id) === e.target.value)
                  if (c) setCastNameManual('')
                }}
              >
                <option value="">一覧から選ぶ（任意）</option>
                {casts.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className={labelClass}>または名前を入力</span>
              <input
                type="text"
                className={inputClass}
                placeholder="例: りな"
                value={castNameManual}
                onChange={(e) => {
                  setCastNameManual(e.target.value)
                  if (e.target.value) setCastId('')
                }}
                disabled={!!castId}
              />
            </label>
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl border border-pink-100 p-4 shadow-sm space-y-3">
        <h2 className="text-sm font-black text-pink-600 border-l-4 border-pink-500 pl-2">
          場所・ホテル
        </h2>
        <label>
          <span className={labelClass}>場所の種類</span>
          <select
            className={inputClass}
            value={locationKind}
            onChange={(e) => setLocationKind(e.target.value as LocationKind)}
          >
            {LOCATION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        {showLocationDetail && (
          <label>
            <span className={labelClass}>ホテル名・エリアなど</span>
            <input
              type="text"
              className={inputClass}
              placeholder="例: 船橋駅前 ○○ホテル 301号室"
              value={locationDetail}
              onChange={(e) => setLocationDetail(e.target.value)}
            />
          </label>
        )}
        {locationKind === 'home' && (
          <>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRepeater}
                onChange={(e) => setIsRepeater(e.target.checked)}
                className="rounded border-pink-300 text-pink-500"
              />
              <span className="text-xs font-bold text-slate-600">
                以前ご利用いただいたリピーター様（住所入力不要）
              </span>
            </label>
            {showAddress && (
              <label>
                <span className={labelClass}>ご自宅の住所</span>
                <textarea
                  className={`${inputClass} min-h-[80px]`}
                  placeholder="都道府県から番地・建物名まで"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </label>
            )}
          </>
        )}
      </section>

      <section className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-4">
        <h2 className="text-sm font-bold text-slate-500 mb-1">オプション</h2>
        <p className="text-xs text-slate-400">アイドル学園用オプションは準備中です。必要な場合は「お伝えしたいこと」にご記入ください。</p>
      </section>

      <section className="bg-white rounded-2xl border border-pink-100 p-4 shadow-sm space-y-3">
        <h2 className="text-sm font-black text-pink-600 border-l-4 border-pink-500 pl-2">
          割引・お支払い
        </h2>
        <label>
          <span className={labelClass}>割引きっ棒</span>
          <select
            className={inputClass}
            value={discountStick}
            onChange={(e) => setDiscountStick(e.target.value as DiscountStick)}
          >
            {DISCOUNT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        {discountStick !== 'none' && (
          <label>
            <span className={labelClass}>割引の詳細（任意）</span>
            <input
              type="text"
              className={inputClass}
              placeholder="クーポン名・コードなど"
              value={discountNote}
              onChange={(e) => setDiscountNote(e.target.value)}
            />
          </label>
        )}
        <div>
          <span className={labelClass}>お支払い方法</span>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setPaymentMethod(o.value)}
                className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                  paymentMethod === o.value
                    ? 'bg-pink-500 text-white border-pink-500'
                    : 'bg-white text-slate-600 border-pink-200'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-pink-100 p-4 shadow-sm space-y-3">
        <label>
          <span className={labelClass}>お伝えしたいこと</span>
          <textarea
            className={`${inputClass} min-h-[100px]`}
            placeholder="ご要望・到着目安など"
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
          />
        </label>

        <div className="border border-pink-100 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowKarteHint((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-pink-50 text-left text-sm font-bold text-pink-700"
          >
            プレイのカルテを記入したい方へ
            <span className="text-pink-400">{showKarteHint ? '▲' : '▼'}</span>
          </button>
          {showKarteHint && (
            <div className="px-4 py-3 text-xs text-slate-600 space-y-2 bg-white">
              <p>
                ご希望・お好みなどを事前にお伝えいただけるカルテ機能を準備中です。詳しい記入は専用ページをご利用ください。
              </p>
              <Link
                href="/funabashi/reserve/karte"
                className="inline-flex items-center justify-center w-full py-2.5 rounded-lg bg-pink-500 text-white font-bold text-sm hover:bg-pink-600 transition"
              >
                カルテ入力ページへ
              </Link>
            </div>
          )}
        </div>
      </section>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-4 rounded-2xl font-black text-white bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg hover:opacity-95 active:scale-[0.99] disabled:opacity-50"
      >
        {submitting ? '送信中...' : '予約内容を送信する'}
      </button>

      <p className="text-[10px] text-center text-slate-400 leading-relaxed">
        ※ 試験版です。内容はCRM連携とスタッフ通知（CRM未接続時）で確認されます。
      </p>
    </form>
  )
}
