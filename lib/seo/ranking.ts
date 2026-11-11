import {
  getHonshimeiRanking,
  getHonshimeiPeriodLabel,
  toDisplayRanking,
} from '@/lib/crm/honshimei-ranking'

export { getHonshimeiPeriodLabel as RANKING_PERIOD_LABEL }

export type RankingCast = {
  id: number
  cast_id: number
  name: string
  age?: number
  image?: string | null
  ranking_order: number
}

export async function getRankingCasts(): Promise<RankingCast[]> {
  const { rankings } = await getHonshimeiRanking()
  return toDisplayRanking(rankings).map((r) => ({
    id: r.id,
    cast_id: r.cast_id,
    name: r.name,
    age: r.age,
    image: r.image,
    ranking_order: r.ranking_order,
  }))
}
