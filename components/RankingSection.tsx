'use client'
import { useState, useEffect } from 'react'
import HonshimeiRankingCards from '@/components/HonshimeiRankingCards'
import type { HonshimeiRankingEntry } from '@/lib/crm/honshimei-ranking'
import { getHonshimeiPeriodLabel } from '@/lib/crm/honshimei-ranking'

type Tab = 'month' | 'last_month'

export default function RankingSection() {
  const [tab, setTab] = useState<Tab>('month')
  const [rankings, setRankings] = useState<HonshimeiRankingEntry[]>([])
  const [periodLabel, setPeriodLabel] = useState(getHonshimeiPeriodLabel())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/idol/honshimei-ranking?period=${tab}`, { cache: 'no-store' })
        if (!res.ok) {
          setRankings([])
          return
        }
        const json = await res.json()
        setRankings(json.rankings ?? [])
        if (json.period_label) {
          setPeriodLabel(json.period_label)
        } else {
          setPeriodLabel(tab === 'month' ? getHonshimeiPeriodLabel() : '先月')
        }
      } catch (err) {
        console.error('Failed to fetch honshimei ranking:', err)
        setRankings([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [tab])

  if (!loading && rankings.length === 0) return null

  const subtitle =
    tab === 'month'
      ? '在籍キャスト一覧（本指名順・リアルタイム更新）'
      : '在籍キャスト一覧（先月の本指名順）'

  return (
    <div>
      <RankingTabs tab={tab} onChange={setTab} />
      <HonshimeiRankingCards
        rankings={rankings}
        periodLabel={periodLabel}
        subtitle={subtitle}
        loading={loading}
      />
    </div>
  )
}

function RankingTabs({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-2">
      <div className="flex gap-2 justify-center">
        <button
          type="button"
          onClick={() => onChange('month')}
          className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all active:scale-95 ${
            tab === 'month'
              ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white border-transparent shadow shadow-pink-200'
              : 'bg-white text-pink-400 border-pink-100 hover:bg-pink-50'
          }`}
        >
          リアルタイム
        </button>
        <button
          type="button"
          onClick={() => onChange('last_month')}
          className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all active:scale-95 ${
            tab === 'last_month'
              ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white border-transparent shadow shadow-pink-200'
              : 'bg-white text-pink-400 border-pink-100 hover:bg-pink-50'
          }`}
        >
          先月分
        </button>
      </div>
    </div>
  )
}
