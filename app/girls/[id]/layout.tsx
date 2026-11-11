import type { Metadata } from 'next'
import { SITE_URL, STORE } from '@/lib/seo/site'

const CRM_BASE = process.env.NEXT_PUBLIC_CRM_API_URL || 'https://crm.st-online.jp/api'

async function getCast(id: string) {
  try {
    const res = await fetch(
      `${CRM_BASE}/public/casts/${encodeURIComponent(id)}?store_code=idol_funabashi`,
      { next: { revalidate: 60 } },
    )
    if (!res.ok) return null
    const json = await res.json()
    return json?.data ?? null
  } catch {
    return null
  }
}

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const cast = await getCast(id)
  if (!cast) {
    return { title: 'キャストプロフィール' }
  }

  const title = `${cast.name}（${cast.age}歳）| 船橋デリヘル`
  const description = `船橋のデリヘル「${STORE.brand}」在籍 ${cast.name}（${cast.age}歳）のプロフィール・出勤・予約。JK・制服コスプレ専門店。`

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/girls/${id}` },
    openGraph: {
      title: `${cast.name} | ${STORE.brand} 船橋`,
      description,
      url: `${SITE_URL}/girls/${id}`,
      type: 'profile',
    },
  }
}

export default function GirlDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}
