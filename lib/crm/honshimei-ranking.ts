import { fetchCrmCasts, isDummyCast, pickImageUrl, type CrmCast } from '@/lib/crm/idol-schedule'
import { IDOL_STORE_ID } from '@/lib/idol-reservation'

const CRM_BASE = process.env.NEXT_PUBLIC_CRM_API_URL || 'https://crm.h-mitsu.com/api'

export const HONSHIMEI_STORE_ID = process.env.HONSHIMEI_RANKING_STORE_ID || '2'

/**
 * 本指名カウントを集約する店舗 ID 群。
 * 掛け持ちキャストは人妻系（store_id=1,3 等）で本指名が付くため、
 * cast_id 単位で全店舗の本指名を合算してアイドル学園在籍に反映する。
 */
export const HONSHIMEI_AGGREGATE_STORE_IDS = (
  process.env.HONSHIMEI_AGGREGATE_STORE_IDS || '1,2,3,4,5'
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

export const HONSHIMEI_REVALIDATE_SECONDS = Number(
  process.env.HONSHIMEI_RANKING_REVALIDATE_SECONDS || 3600
)

/** ランキング表示上限（本指名順） */
export const HONSHIMEI_MAX_RANKED = Number(process.env.HONSHIMEI_MAX_RANKED || 6)

/**
 * 本指名0でもランキング欄に掲載する cast_id（順位なし）
 * 玖由梨（くゆり）・真那（まな）・苺（いちご）
 */
export const HONSHIMEI_PINNED_CAST_IDS = new Set(
  (process.env.HONSHIMEI_PINNED_CAST_IDS || '1259,1306,1254')
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n))
)

export type HonshimeiRankingEntry = {
  /** null = 本指名実績なし（ランク番号なしで表示） */
  rank: number | null
  cast_id: number
  name: string
  age?: number
  photo_url?: string | null
  course_type?: string
}

export type HonshimeiPeriod = 'month' | 'last_month' | 'week' | 'all'

export type HonshimeiRankingResult = {
  rankings: HonshimeiRankingEntry[]
  period: string
  period_label?: string
  generated_at?: string
}

/** 当月ラベル（JST）例: 6月分 */
export function getHonshimeiPeriodLabel(): string {
  const month = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    month: 'numeric',
  }).format(new Date())
  return `${month}月分`
}

function castPhoto(cast: CrmCast): string | null {
  return pickImageUrl(cast.idol_image_path, cast.profile_image, cast.image, cast.thumbnail)
}

function toEntry(cast: CrmCast, rank: number | null): HonshimeiRankingEntry {
  return {
    rank,
    cast_id: Number(cast.id),
    name: cast.name.trim(),
    age: cast.age,
    photo_url: castPhoto(cast),
  }
}

type RawHonshimeiRow = {
  rank: number
  cast_id: number
  name: string
  age?: number
  photo_url?: string | null
  course_type?: string
  count: number
  is_dummy?: boolean
}

async function fetchHonshimeiRows(
  storeId: string,
  period: HonshimeiPeriod,
  limit: number
): Promise<{ rows: RawHonshimeiRow[]; period: string; period_label?: string; generated_at?: string }> {
  const url = new URL(`${CRM_BASE}/rankings/honshimei`)
  url.searchParams.set('store_id', storeId)
  url.searchParams.set('period', period)
  url.searchParams.set('limit', String(limit))

  const cacheOptions =
    period === 'month'
      ? ({ cache: 'no-store' as const })
      : ({ next: { revalidate: HONSHIMEI_REVALIDATE_SECONDS } })

  try {
    const res = await fetch(url.toString(), cacheOptions)
    if (!res.ok) return { rows: [], period }

    const json = await res.json()
    if (!json?.success || !Array.isArray(json.rankings)) {
      return { rows: [], period, period_label: json.period_label }
    }

    const rows: RawHonshimeiRow[] = json.rankings.map(
      (r: RawHonshimeiRow) => ({
        rank: Number(r.rank),
        cast_id: Number(r.cast_id),
        name: r.name,
        age: r.age,
        photo_url: r.photo_url ?? null,
        course_type: r.course_type,
        count: Number(r.count),
        is_dummy: r.is_dummy,
      })
    )

    return {
      rows,
      period: json.period ?? period,
      period_label: json.period_label,
      generated_at: json.generated_at,
    }
  } catch {
    return { rows: [], period }
  }
}

/**
 * アイドル学園在籍キャストを本指名順に並べる。
 * 本指名カウントは複数店舗（人妻系含む）を cast_id で合算する。
 * - ダミー（placehold 画像等）は除外
 * - 本指名順は上位6名まで表示
 * - 本指名0の在籍は原則非表示（ピン留め指定のみ順位なしで掲載）
 * - 件数自体は公開しない（順位のみ）
 */
export async function getHonshimeiRanking(options?: {
  storeId?: string
  period?: HonshimeiPeriod
  limit?: number
}): Promise<HonshimeiRankingResult> {
  const enrolledStoreId = Number(options?.storeId ?? HONSHIMEI_STORE_ID) || IDOL_STORE_ID
  const period = options?.period ?? 'month'
  const limit = options?.limit ?? 50

  const [casts, ...storeResults] = await Promise.all([
    fetchCrmCasts(enrolledStoreId),
    ...HONSHIMEI_AGGREGATE_STORE_IDS.map((sid) => fetchHonshimeiRows(sid, period, limit)),
  ])

  // cast_id ごとに全店舗の本指名数を合算
  const countByCastId = new Map<number, number>()
  let period_label: string | undefined
  let generated_at: string | undefined
  for (const result of storeResults) {
    period_label = period_label ?? result.period_label
    generated_at = generated_at ?? result.generated_at
    for (const row of result.rows) {
      if (row.is_dummy) continue
      const prev = countByCastId.get(row.cast_id) ?? 0
      countByCastId.set(row.cast_id, prev + (row.count || 0))
    }
  }

  const enrolled = casts.filter((c) => !isDummyCast(c))

  const withCount = enrolled.map((cast) => ({
    cast,
    count: countByCastId.get(Number(cast.id)) ?? 0,
  }))

  const ranked = withCount
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, HONSHIMEI_MAX_RANKED)
    .map((x, i) => toEntry(x.cast, i + 1))

  const rankedIds = new Set(ranked.map((r) => r.cast_id))

  const pinned = enrolled
    .filter((c) => HONSHIMEI_PINNED_CAST_IDS.has(Number(c.id)))
    .filter((c) => !rankedIds.has(Number(c.id)))
    .map((c) => toEntry(c, null))

  return {
    rankings: [...ranked, ...pinned],
    period,
    period_label,
    generated_at,
  }
}

/** ガイドページ等で使う共通型（ranking_order = rank） */
export function toDisplayRanking(entries: HonshimeiRankingEntry[]) {
  return entries.map((e) => ({
    id: e.cast_id,
    cast_id: e.cast_id,
    name: e.name,
    age: e.age,
    image: e.photo_url,
    ranking_order: e.rank ?? 999,
    course_type: e.course_type,
  }))
}
