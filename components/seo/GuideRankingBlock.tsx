import Link from 'next/link'
import HonshimeiRankingCards from '@/components/HonshimeiRankingCards'
import {
  getHonshimeiPeriodLabel,
  getHonshimeiRanking,
} from '@/lib/crm/honshimei-ranking'

export default async function GuideRankingBlock() {
  const periodLabel = getHonshimeiPeriodLabel()
  const { rankings } = await getHonshimeiRanking()

  if (rankings.length === 0) {
    return (
      <p className="text-sm text-slate-500 bg-slate-50 rounded-xl p-4 border border-slate-100">
        当月の本指名ランキングデータはまだありません。
        <Link href="/funabashi" className="text-pink-600 font-bold ml-1 underline">
          トップの出勤情報
        </Link>
        からキャストをご確認ください。
      </p>
    )
  }

  return (
    <div className="mt-8">
      <HonshimeiRankingCards
        rankings={rankings}
        periodLabel={periodLabel}
        showGuideLink={false}
        compact
      />
    </div>
  )
}
