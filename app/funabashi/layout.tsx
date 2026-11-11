import type { Metadata } from 'next'
import FunabashiJsonLd from '@/components/seo/FunabashiJsonLd'
import { FUNABASHI_KEYWORDS, JK_LONGTAIL_KEYWORDS } from '@/lib/seo/funabashi'
import { SITE_URL, STORE } from '@/lib/seo/site'

export const metadata: Metadata = {
  title: {
    template: `%s | ${STORE.brand} 船橋`,
    default: `${STORE.brand} 船橋 | 制服・JK系デリヘル【千葉・出張】`,
  },
  description:
    '船橋・西船橋・津田沼のデリヘル「アイドル学園」。JK・制服・コスプレの放課後デート感。JKリフレをお探しの方にも出張でプライベート案内。最短30分・明朗会計。',
  keywords: [...FUNABASHI_KEYWORDS, ...JK_LONGTAIL_KEYWORDS],
  openGraph: {
    title: `${STORE.brand} 船橋 | 制服・JK系デリヘル`,
    description: '船橋で一番かわいい制服デリヘル。JK・女子大生系コスプレで出張案内。',
    url: `${SITE_URL}/funabashi`,
    siteName: STORE.brand,
    images: [{ url: STORE.ogImage, width: 1200, height: 630 }],
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    images: [STORE.ogImage],
  },
  alternates: {
    canonical: `${SITE_URL}/funabashi`,
  },
}

export default function FunabashiLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FunabashiJsonLd />
      {children}
    </>
  )
}
