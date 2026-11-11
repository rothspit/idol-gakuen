import Link from 'next/link'
import { Suspense } from 'react'
import IdolReservationForm from '@/components/reserve/IdolReservationForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getCasts() {
  const base =
    process.env.NEXT_PUBLIC_CRM_API_URL || 'https://crm.st-online.jp/api'
  try {
    const res = await fetch(`${base}/idol/casts?store_id=2&fields=names`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    const json = await res.json()
    const list = Array.isArray(json) ? json : json.casts || json.data || []
    return list.map((c: { id: string | number; cast_id?: number; name: string }) => ({
      id: c.cast_id ?? c.id,
      name: c.name,
    }))
  } catch {
    return []
  }
}

export default async function FunabashiReservePage() {
  const casts = await getCasts()

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-pink-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/funabashi" className="text-sm font-bold text-pink-600">
            ← トップ
          </Link>
          <h1 className="text-sm font-black text-slate-800">WEB予約</h1>
          <span className="w-10" />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="rounded-2xl bg-gradient-to-br from-pink-500 to-rose-400 text-white p-5 shadow-md">
          <p className="text-[10px] font-bold tracking-widest opacity-90">IDOL GAKUEN</p>
          <h2 className="text-xl font-black mt-1">アイドル学園 WEB予約</h2>
          <p className="text-xs mt-2 opacity-95 leading-relaxed">
            ご希望内容を入力のうえ送信してください。店舗スタッフが確認のうえご連絡いたします。
          </p>
        </div>

        {casts.length === 0 && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            キャスト一覧を取得できませんでした。指名は名前の手入力でもご予約いただけます。
          </p>
        )}

        <Suspense fallback={<p className="text-sm text-slate-500">予約フォームを読み込み中…</p>}>
          <IdolReservationForm casts={casts} />
        </Suspense>
      </div>
    </main>
  )
}
