import { cache } from 'react'
import { IDOL_STORE_ID } from '@/lib/idol-reservation'
import { WORKING_STATUSES } from '@/lib/crm/idol-schedule'
import type { IdolPlayItem } from '@/components/IdolPlayList'

const CRM_BASE = process.env.NEXT_PUBLIC_CRM_API_URL || 'https://crm.st-online.jp/api'
const IDOL_PUBLIC_STORE_CODE = 'idol_funabashi'

export type CastDetail = {
  id: number | string
  name: string
  age: number | null
  status: string
  idol_image_path: string | null
  profile_image: string | null
  image: string | null
  gallery_images: string[]
  height: number | null
  bust: number | null
  waist: number | null
  hip: number | null
  cup: string | null
  is_new: boolean
  is_debut_today: boolean
  manager_comment: string | null
  girl_comment: string | null
  today_hours: string | null
  is_attending: boolean
}

export type RelatedCast = {
  id: number | string
  name: string
  image: string | null
  profile_image: string | null
  idol_image_path: string | null
  is_attending: boolean
}

export type TodaySchedule = {
  status?: string
  wait_status?: number | null
  attend_end_time?: string | null
  is_sokudol?: boolean
  schedule_text?: string | null
}

/** 営業日（日本時間・朝8時切替）の YYYY-MM-DD。サーバーのタイムゾーンに依存しない */
function businessTodayJst(): string {
  return new Date(Date.now() + (9 - 8) * 3600_000).toISOString().slice(0, 10)
}

async function fetchJson(url: string, revalidate: number): Promise<any | null> {
  try {
    const res = await fetch(url, { next: { revalidate } })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export const getCastRaw = cache(async (id: string) => {
  const json = await fetchJson(
    `${CRM_BASE}/public/casts/${encodeURIComponent(id)}?store_code=${IDOL_PUBLIC_STORE_CODE}`,
    60,
  )
  return (json?.data ?? null) as Record<string, any> | null
})

async function getTodaySchedule(id: string): Promise<TodaySchedule | null> {
  const date = businessTodayJst()
  const json = await fetchJson(
    `${CRM_BASE}/idol/schedules?store_id=${IDOL_STORE_ID}&date=${date}&cast_id=${encodeURIComponent(id)}`,
    60,
  )
  const days: any[] = json?.schedules ?? []
  const day = days.find((d) => d?.date === date) ?? days[0]
  return (day?.casts ?? []).find((c: any) => Number(c?.cast_id) === Number(id)) ?? null
}

async function getRelatedCasts(id: string): Promise<RelatedCast[]> {
  const json = await fetchJson(`${CRM_BASE}/idol/casts?store_id=${IDOL_STORE_ID}&lite=1`, 120)
  const casts: any[] = json?.casts ?? json?.data ?? []
  return casts
    .filter((c) => String(c.id) !== id && String(c.cast_id) !== id)
    .slice(0, 3)
    .map((c) => ({
      id: c.id,
      name: String(c.name ?? '').trim(),
      image: c.image ?? null,
      profile_image: c.profile_image ?? null,
      idol_image_path: c.idol_image_path ?? null,
      is_attending: Boolean(c.is_attending),
    }))
}

function nonEmpty(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v : null
}

export async function getCastDetailPageData(id: string) {
  const [data, todaySchedule, relatedGirls] = await Promise.all([
    getCastRaw(id),
    getTodaySchedule(id),
    getRelatedCasts(id),
  ])
  if (!data) return null

  const media = data.profile_media ?? {}
  const profile = data.public_profile ?? {}
  const looks = profile.looks ?? {}
  const profileImg = media.profile_image_url || media.thumbnail_url || null

  const girl: CastDetail = {
    id: data.id,
    name: String(data.name ?? '').trim(),
    age: data.age ?? null,
    status: data.status_label || '在籍',
    idol_image_path: profileImg,
    profile_image: profileImg,
    image: profileImg,
    gallery_images: Array.isArray(media.gallery_images) ? media.gallery_images : [],
    height: looks.height ?? data.height ?? null,
    bust: looks.bust ?? data.bust ?? null,
    waist: looks.waist ?? data.waist ?? null,
    hip: looks.hip ?? data.hip ?? null,
    cup: looks.cup ?? data.cup ?? data.cup_size ?? null,
    is_new: Boolean(data.is_new),
    is_debut_today: Boolean(data.is_debut_today),
    manager_comment: nonEmpty(data.manager_comment ?? profile.manager_comment),
    girl_comment: nonEmpty(data.girl_comment ?? profile.girl_comment),
    today_hours: nonEmpty(todaySchedule?.schedule_text),
    is_attending: Boolean(todaySchedule?.status && WORKING_STATUSES.has(todaySchedule.status)),
  }

  const plays: IdolPlayItem[] = Array.isArray(profile.plays) ? profile.plays : []

  return { girl, plays, relatedGirls, todaySchedule }
}
