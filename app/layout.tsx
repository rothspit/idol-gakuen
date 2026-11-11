import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import AgeVerification from '@/components/AgeVerification'
import IdolCtaBar from '@/components/IdolCtaBar'
import IdolStaffChatWidget from '@/components/IdolStaffChatWidget'
import { SITE_URL, STORE } from '@/lib/seo/site'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${STORE.brand} | 船橋の制服・JK系デリヘル`,
  description:
    '千葉県船橋エリア。制服・コスプレ専門デリヘル「アイドル学園」の公式サイト。西船橋・津田沼へ出張。',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AgeVerification />
        {children}

        <footer className="mt-20 bg-slate-900 pb-28 pt-8 text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="mb-6">
              <p className="mb-2 text-xs font-bold text-slate-400">お支払い方法</p>
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-1 rounded bg-white px-3 py-1 text-xs font-bold text-slate-900">
                  💳 Credit Card
                </div>
                <div className="flex items-center gap-1 rounded bg-[#FF0033] px-3 py-1 text-xs font-bold text-white">
                  <span className="mr-1 rounded-sm bg-white px-1 text-[10px] text-[#FF0033]">P</span>
                  PayPay
                </div>
              </div>
              <p className="mt-2 text-[10px] text-slate-500">
                ※PayPayは一部対応していない場合もございます。スタッフまでお問い合わせください。
              </p>
            </div>
            <p className="text-xs text-slate-600">&copy; 2026 IDOL GAKUEN. All rights reserved.</p>
          </div>
        </footer>

        <IdolCtaBar />
        <IdolStaffChatWidget />
      </body>
    </html>
  )
}
