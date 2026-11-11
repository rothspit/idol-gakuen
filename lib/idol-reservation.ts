import { getBusinessToday } from '@/lib/business-date'
import { IDOL_CATALOG_COURSES } from '@/lib/idol-pricing'

export const IDOL_STORE_ID = 2
export const IDOL_STORE_NAME = 'アイドル学園'

export type NominationKind = 'free' | 'photo' | 'repeat'

export type LocationKind = 'home' | 'hotel_business' | 'hotel_love' | 'other'

export type PaymentMethod = 'cash' | 'card' | 'paypay'

export type DiscountStick =
  | 'none'
  | 'sokuhime'
  | 'x_campaign'
  | 'site_coupon'
  | 'other'

export type IdolReservationInput = {
  phone: string
  date: string
  time: string
  courseMinutes: number
  coursePriceYen: number
  nominationKind: NominationKind
  castId: string | null
  castName: string | null
  locationKind: LocationKind
  locationDetail: string
  address: string
  isRepeater: boolean
  discountStick: DiscountStick
  discountNote: string
  paymentMethod: PaymentMethod
  customerNote: string
  storeName: string
}

export const NOMINATION_LABELS: Record<NominationKind, string> = {
  free: 'フリー',
  photo: '写真指名',
  repeat: '本指名',
}

export const LOCATION_OPTIONS: { value: LocationKind; label: string }[] = [
  { value: 'home', label: 'ご自宅' },
  { value: 'hotel_business', label: 'ビジネスホテル' },
  { value: 'hotel_love', label: 'ラブホテル' },
  { value: 'other', label: 'その他（詳細を備考へ）' },
]

export const DISCOUNT_OPTIONS: { value: DiscountStick; label: string }[] = [
  { value: 'none', label: '割引なし' },
  { value: 'sokuhime', label: '即姫割引' },
  { value: 'x_campaign', label: 'X（旧Twitter）割引' },
  { value: 'site_coupon', label: 'サイト・クーポン割引' },
  { value: 'other', label: 'その他（備考に記載）' },
]

export const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: '現金' },
  { value: 'card', label: 'カード' },
  { value: 'paypay', label: 'PayPay' },
]

export const COURSE_OPTIONS = IDOL_CATALOG_COURSES.filter((c) => c.durationMinutes <= 180)

export function buildTimeSlotOptions(): string[] {
  const slots: string[] = []
  for (let h = 10; h <= 29; h++) {
    const hour = h % 24
    const dayOffset = h >= 24 ? '（翌）' : ''
    for (const m of [0, 30]) {
      if (h === 29 && m === 30) break
      slots.push(`${dayOffset}${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return slots
}

export function buildDateOptions(count = 7): { value: string; label: string }[] {
  const week = ['日', '月', '火', '水', '木', '金', '土']
  const base = getBusinessToday()
  const out: { value: string; label: string }[] = []

  for (let i = 0; i < count; i++) {
    const d = new Date(base)
    d.setDate(base.getDate() + i)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    let prefix = ''
    if (i === 0) prefix = '本日 '
    else if (i === 1) prefix = '明日 '
    out.push({
      value,
      label: `${prefix}${d.getMonth() + 1}/${d.getDate()}（${week[d.getDay()]}）`,
    })
  }
  return out
}

export function validateIdolReservation(input: IdolReservationInput): string | null {
  const phone = input.phone.replace(/[^0-9]/g, '')
  if (phone.length < 10) return '電話番号を正しく入力してください'
  if (!input.date) return 'ご希望日を選択してください'
  if (!input.courseMinutes) return 'コースを選択してください'

  if (input.nominationKind !== 'free') {
    const name = input.castName?.trim()
    if (!name) return '指名の場合はキャスト名を選択または入力してください'
  }

  if (input.locationKind === 'home' && !input.isRepeater) {
    if (!input.address.trim()) return 'ご自宅の場合は住所を入力してください（リピーター様は不要）'
  }

  if (input.locationKind !== 'home' && !input.locationDetail.trim()) {
    return 'ホテル名・エリアなどを入力してください'
  }

  if (!input.storeName.trim()) return '店舗名が未設定です'

  return null
}

/** CRM `POST /api/reserve` 用ペイロード */
export function toCrmReservePayload(input: IdolReservationInput) {
  const phone = input.phone.replace(/[^0-9]/g, '').slice(0, 20)
  const nominationType =
    input.nominationKind === 'repeat' ? 'main' : input.nominationKind

  let placeType: 'home' | 'hotel' | 'meetup' = 'hotel'
  if (input.locationKind === 'home') placeType = 'home'
  else if (input.locationKind === 'other') placeType = 'meetup'

  let placeDetail = input.locationDetail.trim()
  if (input.locationKind === 'home') {
    if (!input.isRepeater && input.address.trim()) {
      placeDetail = input.address.trim()
    }
  } else if (input.locationKind === 'hotel_love' && placeDetail) {
    placeDetail = `ラブホテル ${placeDetail}`
  } else if (input.locationKind === 'hotel_business' && placeDetail) {
    placeDetail = `ビジネスホテル ${placeDetail}`
  }

  const noteLines: string[] = []
  if (input.storeName.trim()) noteLines.push(`店舗名: ${input.storeName.trim()}`)
  if (input.isRepeater) noteLines.push('【リピーター様】')
  if (input.discountStick !== 'none') {
    const label =
      DISCOUNT_OPTIONS.find((d) => d.value === input.discountStick)?.label ??
      input.discountStick
    noteLines.push(
      `割引: ${label}${input.discountNote.trim() ? `（${input.discountNote.trim()}）` : ''}`
    )
  }
  if (input.customerNote.trim()) noteLines.push(input.customerNote.trim())

  const isNextDay = /翌/.test(input.time)
  const timeRaw = input.time.replace(/（翌）/g, '').replace(/翌/g, '').trim()
  const isAsap = !timeRaw || timeRaw === 'asap'

  let date = input.date
  if (isNextDay && date) {
    const d = new Date(`${date}T12:00:00`)
    if (!Number.isNaN(d.getTime())) {
      d.setDate(d.getDate() + 1)
      date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }
  }

  const storeId = Number(
    process.env.CRM_IDOL_STORE_ID ||
      process.env.NEXT_PUBLIC_IDOL_STORE_ID ||
      IDOL_STORE_ID
  )

  const payload: Record<string, string | number> = {
    store_id: Number.isFinite(storeId) && storeId > 0 ? storeId : IDOL_STORE_ID,
    date,
    course_minutes: input.courseMinutes,
    course_name: `${input.courseMinutes}分コース`,
    course_price: input.coursePriceYen,
    nomination_type: nominationType,
    place_type: placeType,
    customer_phone: phone,
    payment_method: input.paymentMethod,
    total_price: input.coursePriceYen,
  }

  if (!isAsap) payload.in_time = timeRaw

  if (input.nominationKind !== 'free') {
    if (input.castId) {
      const id = parseInt(input.castId, 10)
      if (!Number.isNaN(id)) payload.cast_id = id
    }
    if (input.castName?.trim()) payload.cast_name = input.castName.trim()
  }

  if (placeDetail) payload.place_detail = placeDetail

  const notes = noteLines.join('\n').slice(0, 2000)
  if (notes) payload.notes = notes

  return payload
}
