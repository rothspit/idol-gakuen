'use client'

export type IdolPlayItem = {
  id?: number | string
  category?: string
  label?: string
  status?: string
  status_label?: string
  memo?: string | null
  price?: number | null
  is_specialty?: boolean
  display_order?: number
}

const CATEGORY_ORDER = [
  '基本プレイ',
  'オプションプレイ(無料)',
  'オプションプレイ(有料)',
  'その他',
] as const

const CATEGORY_SHORT: Record<string, string> = {
  '基本プレイ': '基本',
  'オプションプレイ(無料)': '無料OP',
  'オプションプレイ(有料)': '有料OP',
  'その他': 'その他',
}

function statusTone(status: string, statusLabel: string): string {
  if (status === 'ok' || statusLabel === '可') {
    return 'text-pink-600 bg-pink-50 border-pink-200'
  }
  if (status === 'ng' || statusLabel === '不可') {
    return 'text-slate-400 bg-slate-50 border-slate-100'
  }
  if (
    status.startsWith('shio_') ||
    status.startsWith('paipan_') ||
    status.startsWith('svc_') ||
    status === 'soudan' ||
    status === 'aite' ||
    statusLabel === '相談' ||
    statusLabel === '相手次第'
  ) {
    return 'text-rose-600 bg-rose-50/80 border-rose-100'
  }
  return 'text-amber-700 bg-amber-50/80 border-amber-100'
}

function groupByCategory(plays: IdolPlayItem[]): { category: string; items: IdolPlayItem[] }[] {
  const map = new Map<string, IdolPlayItem[]>()
  for (const play of plays) {
    const cat = (play.category || 'その他').trim() || 'その他'
    if (!map.has(cat)) map.set(cat, [])
    map.get(cat)!.push(play)
  }

  const ordered: { category: string; items: IdolPlayItem[] }[] = []
  for (const cat of CATEGORY_ORDER) {
    const items = map.get(cat)
    if (items?.length) {
      ordered.push({ category: cat, items })
      map.delete(cat)
    }
  }
  for (const [category, items] of map) {
    if (items.length) ordered.push({ category, items })
  }
  return ordered
}

function formatPrice(price: number | null | undefined): string | null {
  if (price == null || !Number.isFinite(price) || price <= 0) return null
  return `¥${Math.round(price).toLocaleString('ja-JP')}`
}

export default function IdolPlayList({ plays }: { plays: IdolPlayItem[] }) {
  if (!Array.isArray(plays) || plays.length === 0) return null

  const groups = groupByCategory(plays)
  if (groups.length === 0) return null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-idol-play-fade">
      <div className="p-5 pb-2">
        <h2 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2 border-l-4 border-pink-500 pl-3 font-rounded">
          <span className="text-pink-500" aria-hidden>
            ♡
          </span>
          プレイリスト
        </h2>
        <p className="text-[11px] text-slate-400 pl-4 mb-3">できること・得意なことをチェック</p>
      </div>

      <div className="px-4 pb-5 space-y-5">
        {groups.map(({ category, items }) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-pink-100 to-rose-50 text-pink-700 text-[11px] font-bold px-2.5 py-0.5 border border-pink-200/80">
                {CATEGORY_SHORT[category] || category}
              </span>
              <span className="text-[10px] text-slate-300 tabular-nums">{items.length}</span>
            </div>

            <ul className="rounded-xl border border-pink-100/80 bg-gradient-to-b from-pink-50/40 to-white overflow-hidden divide-y divide-pink-50">
              {items.map((play, idx) => {
                const label = (play.label || '').trim() || '—'
                const statusLabel = (play.status_label || '').trim() || '要確認'
                const status = (play.status || '').trim()
                const priceText = formatPrice(play.price)
                const key = String(play.id ?? `${category}-${label}-${idx}`)

                return (
                  <li
                    key={key}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 min-h-[44px]"
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className="text-sm text-slate-700 font-medium leading-snug truncate">
                        {label}
                      </span>
                      {play.is_specialty ? (
                        <span className="shrink-0 text-[10px] font-bold text-white bg-gradient-to-r from-pink-500 to-rose-400 px-1.5 py-0.5 rounded-full shadow-sm">
                          得意
                        </span>
                      ) : null}
                      {priceText ? (
                        <span className="shrink-0 text-[10px] font-bold text-pink-500/90 tabular-nums">
                          {priceText}
                        </span>
                      ) : null}
                    </div>
                    <span
                      className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full border tabular-nums ${statusTone(status, statusLabel)}`}
                    >
                      {statusLabel}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
