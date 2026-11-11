import { IDOL_STORE_ID } from '@/lib/idol-reservation'

const CRM_BASE = process.env.NEXT_PUBLIC_CRM_API_URL || 'https://crm.st-online.jp/api'

/** schedules API で除外しない（休み系のみ除外） */
const EXCLUDED_SCHEDULE_STATUSES = new Set(['休み', 'お休み', '欠勤', '休暇'])

/** 出勤扱いのステータス（casts / schedules 両方） */
export const WORKING_STATUSES = new Set([
  '出勤',
  '登校',
  '登校中',
  '即案内可能',
  '待機中',
  '接客中',
])

export type DisplayCast = {
  id: string
  cast_id: number
  name: string
  age?: number
  status: string
  wait_status?: number
  attend_end_time?: string | null
  is_sokudol?: boolean
  is_new?: boolean
  is_debut_day?: boolean
  is_debut_today?: boolean
  comment?: string
  start_time?: string
  end_time?: string
  is_schedule_dummy?: boolean
  idol_image_path?: string | null
  profile_image?: string | null
  image?: string | null
  thumbnail?: string | null
  today_hours?: string | null
}

export type CrmCast = {
  id: number
  name: string
  age?: number
  status?: string
  idol_image_path?: string | null
  profile_image?: string | null
  image?: string | null
  thumbnail?: string | null
  is_attending?: boolean
  today_hours?: string | null
  comment?: string
  is_dummy?: boolean
}

/** CRM の仮画像（placehold.co 等）。img タグでは Safari 等で壊れて表示される */
export function isPlaceholderImage(url?: string | null): boolean {
  if (!url) return false
  return url.includes('placehold.co') || url.includes('via.placeholder.com')
}

/** 最初の有効な（非プレースホルダー）URL を返す */
export function pickImageUrl(...candidates: (string | null | undefined)[]): string | null {
  for (const url of candidates) {
    if (url && !isPlaceholderImage(url)) return url
  }
  return null
}

/** ダミー・仮登録キャスト（ランキング対象外） */
export function isDummyCast(cast: {
  name?: string
  idol_image_path?: string | null
  profile_image?: string | null
  image?: string | null
  is_dummy?: boolean
}): boolean {
  if (cast.is_dummy === true) return true
  const img = cast.idol_image_path || cast.profile_image || cast.image || ''
  return img.includes('placehold.co')
}

type ScheduleEntry = {
  id?: number
  cast_id: number
  name: string
  status?: string
  wait_status?: number
  attend_end_time?: string | null
  is_sokudol?: boolean
  is_new?: boolean
  is_debut_day?: boolean
  is_debut_today?: boolean
  comment?: string
  start_time?: string
  end_time?: string
  is_schedule_dummy?: boolean
  idol_image_path?: string | null
  profile_image?: string | null
  image?: string | null
  thumbnail?: string | null
  age?: number
}

function normalizeNameKey(name: string) {
  const paren = name.match(/（([^）]+)）/)
  if (paren?.[1]) return paren[1].trim()
  return name.trim()
}

export function matchCrmCastByName(crmCasts: CrmCast[], localName: string): CrmCast | undefined {
  const key = normalizeNameKey(localName)
  return crmCasts.find((c) => {
    if (c.name === localName) return true
    if (c.name.includes(localName) || localName.includes(c.name)) return true
    const crmKey = normalizeNameKey(c.name)
    return crmKey === key || c.name.includes(key) || key.includes(crmKey)
  })
}

function formatScheduleHours(start?: string, end?: string): string | null {
  const s = start ? start.substring(0, 5) : ''
  const e = end ? end.substring(0, 5) : ''
  if (s && e) return `${s} - ${e}`
  if (s) return `${s} - LAST`
  if (e) return `OPEN - ${e}`
  return null
}

function enrichFromCrm(entry: ScheduleEntry, crm?: CrmCast): DisplayCast {
  const castId = Number(entry.cast_id)
  return {
    id: String(entry.id ?? `crm-${castId}`),
    cast_id: castId,
    name: entry.name || crm?.name || '',
    age: entry.age ?? crm?.age,
    status: entry.status || crm?.status || '出勤',
    wait_status: entry.wait_status,
    attend_end_time: entry.attend_end_time ?? null,
    is_sokudol: entry.is_sokudol === true,
    is_new: entry.is_new === true || entry.is_debut_today === true,
    is_debut_day: entry.is_debut_day === true,
    is_debut_today: entry.is_debut_today === true,
    comment: entry.comment || crm?.comment,
    start_time: entry.start_time,
    end_time: entry.end_time,
    is_schedule_dummy: entry.is_schedule_dummy === true,
    idol_image_path: pickImageUrl(entry.idol_image_path, crm?.idol_image_path),
    profile_image: pickImageUrl(entry.profile_image, crm?.profile_image),
    image: pickImageUrl(entry.image, crm?.image),
    thumbnail: pickImageUrl(entry.thumbnail, crm?.thumbnail),
    today_hours: formatScheduleHours(entry.start_time, entry.end_time),
  }
}

export function fromCrmCast(crm: CrmCast, status = '出勤'): DisplayCast {
  return {
    id: `cast-${crm.id}`,
    cast_id: crm.id,
    name: crm.name,
    age: crm.age,
    status,
    comment: crm.comment,
    idol_image_path: crm.idol_image_path,
    profile_image: crm.profile_image,
    image: crm.image,
    thumbnail: crm.thumbnail,
    today_hours: crm.today_hours,
  }
}

function shouldIncludeScheduleEntry(entry: ScheduleEntry) {
  const status = entry.status?.trim()
  if (!status) return true
  if (EXCLUDED_SCHEDULE_STATUSES.has(status)) return false
  return true
}

export async function fetchCrmCasts(storeId = IDOL_STORE_ID): Promise<CrmCast[]> {
  const res = await fetch(`${CRM_BASE}/idol/casts?store_id=${storeId}&lite=1`, {
    next: { revalidate: 120 },
  })
  if (!res.ok) return []
  const json = await res.json()
  return Array.isArray(json) ? json : json.casts || json.data || []
}

/** 予約フォーム用：名前だけ */
export async function fetchCrmCastNames(storeId = IDOL_STORE_ID): Promise<{ id: number; name: string }[]> {
  const res = await fetch(`${CRM_BASE}/idol/casts?store_id=${storeId}&fields=names`, {
    next: { revalidate: 300 },
  })
  if (!res.ok) return []
  const json = await res.json()
  const casts = Array.isArray(json) ? json : json.casts || json.data || []
  return casts
    .map((c: { id?: number; cast_id?: number; name?: string }) => ({
      id: Number(c.cast_id ?? c.id),
      name: String(c.name ?? ''),
    }))
    .filter((c: { id: number; name: string }) => Number.isFinite(c.id) && c.name)
}

/** 詳細ページ用：1件だけ */
export async function fetchCrmCastById(
  castId: string | number,
  storeCode = 'idol_funabashi',
): Promise<Record<string, unknown> | null> {
  const res = await fetch(
    `${CRM_BASE}/public/casts/${encodeURIComponent(String(castId))}?store_code=${encodeURIComponent(storeCode)}`,
    { next: { revalidate: 60 } },
  )
  if (!res.ok) return null
  const json = await res.json()
  const data = json?.data
  if (!data || typeof data !== 'object') return null

  const media = (data.profile_media ?? {}) as Record<string, unknown>
  const gallery = Array.isArray(media.gallery_images) ? media.gallery_images : []
  const profileImg =
    (typeof media.profile_image_url === 'string' && media.profile_image_url) ||
    (typeof media.thumbnail_url === 'string' && media.thumbnail_url) ||
    null
  const looks = ((data.public_profile as Record<string, unknown> | undefined)?.looks ??
    {}) as Record<string, unknown>

  return {
    id: data.id,
    name: data.name,
    age: data.age,
    status: data.status_label || '在籍',
    idol_image_path: profileImg,
    profile_image: profileImg,
    image: profileImg,
    gallery_images: gallery,
    height: looks.height ?? data.height,
    bust: looks.bust ?? data.bust,
    waist: looks.waist ?? data.waist,
    hip: looks.hip ?? data.hip,
    is_new: Boolean(data.is_new),
    is_debut_today: Boolean(data.is_debut_today),
    manager_comment: data.manager_comment,
    girl_comment: data.girl_comment,
    public_profile: data.public_profile,
  }
}

export async function fetchCrmScheduleForDate(
  date: string,
  storeId = IDOL_STORE_ID
): Promise<ScheduleEntry[]> {
  const res = await fetch(`${CRM_BASE}/idol/schedules?store_id=${storeId}&date=${date}`, {
    next: { revalidate: 30 },
  })
  if (!res.ok) return []
  const json = await res.json()
  const day =
    json.schedules?.find((d: { date?: string }) => d.date === date) ?? json.schedules?.[0]
  return day?.casts ?? []
}

/**
 * CRM schedules を正本に表示行を組み立てる。
 * casts API は画像・年齢などの補完のみ（本日出勤フラグで他日付へ載せない）。
 */
export function mergeScheduleWithCasts(
  scheduleEntries: ScheduleEntry[],
  crmCasts: CrmCast[]
): DisplayCast[] {
  const castById = new Map<number, CrmCast>()
  for (const c of crmCasts) castById.set(Number(c.id), c)

  const rows: DisplayCast[] = []

  for (const entry of scheduleEntries) {
    if (!shouldIncludeScheduleEntry(entry)) continue
    const castId = Number(entry.cast_id)
    if (!Number.isFinite(castId)) continue
    rows.push(enrichFromCrm(entry, castById.get(castId)))
  }

  return rows
}

/** CRM schedules + casts を統合（画像・年齢補完、過剰フィルタを解消） */
export async function mergeIdolScheduleForDate(
  date: string,
  storeId = IDOL_STORE_ID
): Promise<DisplayCast[]> {
  const [scheduleEntries, crmCasts] = await Promise.all([
    fetchCrmScheduleForDate(date, storeId),
    fetchCrmCasts(storeId),
  ])
  return mergeScheduleWithCasts(scheduleEntries, crmCasts)
}

export function getImageUrl(g: Pick<DisplayCast, 'idol_image_path' | 'profile_image' | 'image' | 'thumbnail'>) {
  return pickImageUrl(g.idol_image_path, g.profile_image, g.image, g.thumbnail)
}
