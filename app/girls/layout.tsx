import type { Metadata } from 'next'
import { SITE_URL, STORE } from '@/lib/seo/site'

export const metadata: Metadata = {
  title: '在籍キャスト一覧',
  description: `船橋・千葉のデリヘル「${STORE.brand}」在籍キャスト一覧。JK・制服系のキャストプロフィール・出勤・予約はこちら。`,
  alternates: { canonical: `${SITE_URL}/girls` },
  openGraph: {
    title: `在籍キャスト一覧 | ${STORE.brand} 船橋`,
    description: '船橋デリヘル アイドル学園の在籍キャストを一覧でチェック。',
    url: `${SITE_URL}/girls`,
  },
}

export default function GirlsLayout({ children }: { children: React.ReactNode }) {
  return children
}
