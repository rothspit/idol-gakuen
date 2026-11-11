import { notFound } from 'next/navigation'
import { getCastDetailPageData } from '@/lib/crm/cast-detail'
import { SITE_URL } from '@/lib/seo/site'
import GirlDetailView from './GirlDetailView'

type Props = { params: Promise<{ id: string }> }

export default async function GirlDetailPage({ params }: Props) {
  const { id } = await params
  const pageData = await getCastDetailPageData(id)
  if (!pageData) notFound()

  const { girl, plays, relatedGirls, todaySchedule } = pageData

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'トップ', item: `${SITE_URL}/funabashi` },
      { '@type': 'ListItem', position: 2, name: '在籍一覧', item: `${SITE_URL}/girls` },
      { '@type': 'ListItem', position: 3, name: girl.name, item: `${SITE_URL}/girls/${id}` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <GirlDetailView
        girl={girl}
        plays={plays}
        relatedGirls={relatedGirls}
        todaySchedule={todaySchedule}
      />
    </>
  )
}
