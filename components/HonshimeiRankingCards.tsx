import Link from 'next/link'
import CastImage from '@/components/CastImage'
import type { HonshimeiRankingEntry } from '@/lib/crm/honshimei-ranking'

type Props = {
  rankings: HonshimeiRankingEntry[]
  periodLabel: string
  subtitle?: string
  showGuideLink?: boolean
  compact?: boolean
  loading?: boolean
}

function rankBadgeClass(rank: number) {
  if (rank === 1) return 'bg-gradient-to-br from-pink-400 to-rose-400 text-lg shadow-pink-200'
  if (rank === 2) return 'bg-gradient-to-br from-slate-300 to-slate-400 shadow-slate-200'
  if (rank === 3) return 'bg-gradient-to-br from-amber-600 to-amber-500 shadow-amber-200'
  return 'bg-gradient-to-br from-pink-300 to-pink-400 text-sm'
}

export default function HonshimeiRankingCards({
  rankings,
  periodLabel,
  subtitle = '在籍キャスト一覧（本指名順）',
  showGuideLink = true,
  compact = false,
  loading = false,
}: Props) {
  if (rankings.length === 0 && !loading) return null

  return (
    <div className={`relative ${compact ? '' : 'max-w-2xl mx-auto px-4 py-8'}`}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 rounded-2xl">
          <span className="text-sm text-pink-400 font-bold">読み込み中...</span>
        </div>
      )}
      <h2
        className={`font-black text-center mb-2 text-pink-600 flex items-center justify-center gap-2 ${
          compact ? 'text-base mb-4' : 'text-xl mb-6'
        }`}
      >
        <span className="text-pink-400 text-2xl">👑</span>
        {periodLabel}の本指名ランキング
      </h2>
      <p className="text-center text-[10px] text-slate-500 mb-4">{subtitle}</p>
      {showGuideLink && (
        <p className="text-center text-[10px] text-pink-400 mb-4">
          <Link href="/funabashi/guide/ranking" className="underline font-bold hover:text-pink-600">
            ランキングの見方・詳細はこちら
          </Link>
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {rankings.map((entry) => (
          <Link
            href={`/girls/${entry.cast_id}`}
            key={entry.cast_id}
            className="block relative group"
          >
            {entry.rank != null && (
              <div
                className={`absolute -top-3 -left-2 z-10 w-8 h-8 flex items-center justify-center rounded-full font-black text-white shadow-sm border-2 border-white ${rankBadgeClass(entry.rank)}`}
              >
                {entry.rank}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-pink-100 group-hover:shadow-md transition-shadow">
              <div className="aspect-[4/5] bg-pink-50 relative">
                {entry.photo_url ? (
                  <CastImage
                    src={entry.photo_url}
                    alt={entry.name}
                    fill
                    className="transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-pink-300 font-bold">
                    No Photo
                  </div>
                )}
              </div>
              <div className="p-2 text-center bg-white relative z-10">
                <div className="font-rounded font-black text-sm text-pink-600 drop-shadow-sm truncate">
                  {entry.name}
                </div>
                {entry.age != null && (
                  <div className="font-rounded text-[10px] text-pink-400 mt-0.5">{entry.age}歳</div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
