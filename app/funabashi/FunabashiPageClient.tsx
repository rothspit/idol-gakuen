'use client'
import Link from 'next/link'
import { Noto_Sans_JP } from 'next/font/google'
import type { ReactNode } from 'react'

const baseFont = Noto_Sans_JP({
  weight: ['700', '900'],
  subsets: ['latin'],
  preload: false,
})

import RankingSection from '@/components/RankingSection'
import PriceListIdol from '@/components/PriceListIdol'
import CardPayment from '@/components/CardPayment'
import FunabashiSeoContent from '@/components/seo/FunabashiSeoContent'

type FunabashiPageClientProps = {
  schedule: ReactNode
}

export default function FunabashiPageClient({ schedule }: FunabashiPageClientProps) {
  return (
    <main className="bg-slate-50 min-h-screen pb-32 relative">
      {/* フォント&アニメーション */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;700;800&display=swap');

        .font-rounded { font-family: 'M PLUS Rounded 1c', sans-serif; }

        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        .wiggle { animation: wiggle 0.5s ease-in-out infinite; }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }

        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        .sparkle { animation: sparkle 1.5s ease-in-out infinite; }

        @keyframes rainbow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .rainbow-bg {
          background: linear-gradient(90deg, #FF69B4, #87CEEB, #FFD700, #FF69B4);
          background-size: 300% 300%;
          animation: rainbow 3s ease infinite;
        }
      `}</style>

      {/* ヘッダー */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur text-pink-600 shadow-sm border-b border-pink-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/funabashi" className={`${baseFont.className} text-xl font-black tracking-wider hover:opacity-80 transition-opacity`}>
            アイドル<span className="text-pink-400">学園</span>
          </Link>
          <Link href="/recruit" className="bg-yellow-400 text-slate-900 text-[10px] font-black px-3 py-2 rounded shadow-sm hover:bg-yellow-300">求人</Link>
        </div>
      </div>

      {/* 出勤スケジュール */}
      <div className="pt-4">{schedule}</div>

      <RankingSection />

      {/* 在籍一覧ボタン */}
      <div className="max-w-2xl mx-auto px-4 mb-6 space-y-3">
        <Link href="/girls" className="block w-full bg-white border-2 border-slate-200 text-slate-600 font-bold py-3 rounded-xl text-center shadow-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
          <span>👥</span> 在籍キャスト一覧を見る
          <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full text-slate-500">全員</span>
        </Link>
      </div>

      {/* ========== 生徒手帳（会員ポイント）カード ========== */}
      <div className="max-w-2xl mx-auto px-4 my-8">
        <div className="relative overflow-hidden rounded-2xl shadow-sm border border-pink-100" style={{
          background: 'linear-gradient(135deg, #FFF0F5 0%, #FFE4E1 50%, #F0F8FF 100%)',
        }}>
          {/* キラキラエフェクト */}
          <div className="absolute top-2 right-4 text-2xl sparkle">✨</div>
          <div className="absolute top-8 right-12 text-lg sparkle" style={{ animationDelay: '0.5s' }}>⭐</div>
          <div className="absolute bottom-4 left-4 text-xl sparkle" style={{ animationDelay: '1s' }}>💖</div>

          <div className="relative z-10 p-5">
            {/* ヘッダー部分 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-2xl">🎒</span>
                </div>
                <div>
                  <p className="font-rounded font-bold text-slate-500 text-xs tracking-wider">IDOL GAKUEN</p>
                  <p className="font-rounded font-extrabold text-pink-500 text-lg">生徒手帳</p>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur rounded-lg px-3 py-1 shadow-sm border border-pink-100">
                <p className="text-[10px] text-pink-400 font-bold">STUDENT ID</p>
              </div>
            </div>

            {/* メインコンテンツ */}
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="text-center">
                <p className="font-rounded text-pink-600 text-xs font-bold mb-1">🎉 新入生応援キャンペーン 🎉</p>
                <p className="font-rounded text-slate-800 text-sm font-bold mb-2">今なら入学祝いとして</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-rounded text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
                    2,000
                  </span>
                  <span className="font-rounded text-xl font-bold text-pink-500">pt</span>
                </div>
                <p className="font-rounded text-slate-600 text-xs mt-1">プレゼント！（2,000円相当）</p>
              </div>

              <div className="mt-4 space-y-2">
                {[
                  '初登校ですぐ使える！',
                  '1pt = 1円で利用OK！',
                  '誕生日には2倍ptプレゼント🎂',
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-700 text-xs font-rounded font-bold">
                    <span className="text-pink-400">♡</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <PriceListIdol />
      <CardPayment />

      <FunabashiSeoContent />

      {/* フッター */}
      <div className="mt-8 bg-pink-50 text-slate-700 text-center py-8 px-4 mb-20">
        <h3 className="font-bold mb-2">キャスト・スタッフ募集中</h3>
        <p className="text-xs text-slate-500 mb-4">アイドル学園で一緒に働きませんか？</p>
        <Link href="/recruit" className="inline-block border-2 border-pink-400 text-pink-500 font-bold px-6 py-2 rounded-full hover:bg-pink-400 hover:text-white transition-colors">採用情報を見る</Link>
      </div>

      {/* 追尾フッター */}
      <div className="fixed bottom-0 left-0 w-full z-40 pointer-events-none">
        <div className="absolute inset-0 bg-white/70 backdrop-blur-md border-t border-white/40 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] pb-safe"></div>
        <div className="max-w-2xl mx-auto relative pointer-events-auto px-3 py-2 pb-safe flex gap-2 items-stretch">
          <a href="tel:05017459665" className="flex-1 group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 to-rose-300 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <div className="relative h-full bg-gradient-to-br from-white/90 to-white/60 backdrop-blur rounded-2xl p-[1px] shadow-sm overflow-hidden transform transition-all duration-300 hover:-translate-y-1 active:scale-98 ring-1 ring-pink-200/50">
              <div className="rounded-2xl flex flex-col items-center justify-center py-3 h-full transition-colors group-hover:bg-white/50">
                <span className="text-xl mb-0.5 drop-shadow-sm text-pink-500">📞</span>
                <span className="text-[11px] font-black text-pink-600 tracking-wide">電話で予約・空き確認</span>
              </div>
            </div>
          </a>
          <Link href="/funabashi/reserve" className="flex-1 group relative">
            <div className="relative h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl shadow-lg shadow-pink-400/40 overflow-hidden transform transition-all duration-300 hover:-translate-y-1 active:scale-98">
              <div className="rounded-2xl flex flex-col items-center justify-center py-3 h-full text-white">
                <span className="text-xl mb-0.5 drop-shadow-sm">📋</span>
                <span className="text-[11px] font-black tracking-wide">WEBで予約する</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="pb-32"></div>
    </main>
  )
}
