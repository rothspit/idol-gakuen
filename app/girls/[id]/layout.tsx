import type { Metadata } from 'next'
import { SITE_URL, STORE } from '@/lib/seo/site'
import { getCastRaw } from '@/lib/crm/cast-detail'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const cast = await getCastRaw(id)
  if (!cast) {
    return { title: 'キャストプロフィール' }
  }

  const name = String(cast.name ?? '').trim()
  const looks = cast.public_profile?.looks ?? {}
  const height = looks.height ?? cast.height
  const cup = looks.cup ?? cast.cup ?? cast.cup_size
  const size = [height ? `T${height}` : '', cup ? `${cup}カップ` : ''].filter(Boolean).join('・')
  const image = cast.profile_media?.profile_image_url || cast.profile_media?.thumbnail_url

  const title = `${name}（${cast.age}歳）| 船橋デリヘル`
  const description = `船橋のデリヘル「${STORE.brand}」在籍 ${name}（${cast.age}歳${size ? `・${size}` : ''}）のプロフィール・写真・店長コメント・本日の出勤・予約。JK・制服コスプレ専門店。`

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/girls/${id}` },
    openGraph: {
      title: `${name} | ${STORE.brand} 船橋`,
      description,
      url: `${SITE_URL}/girls/${id}`,
      type: 'profile',
      ...(image ? { images: [{ url: image, alt: name }] } : {}),
    },
  }
}

export default function GirlDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}
