'use client'

import Link from 'next/link'
import { useState } from 'react'

const inputClass =
  'w-full rounded-xl border border-pink-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200/60'

export default function ReserveKartePage() {
  const [saved, setSaved] = useState(false)

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data = {
      preference: String(fd.get('preference') || ''),
      ng: String(fd.get('ng') || ''),
      memo: String(fd.get('memo') || ''),
      savedAt: new Date().toISOString(),
    }
    try {
      localStorage.setItem('idol_reserve_karte_draft', JSON.stringify(data))
    } catch {
      /* ignore */
    }
    setSaved(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-pink-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/funabashi/reserve" className="text-sm font-bold text-pink-600">
            ← 予約フォーム
          </Link>
          <h1 className="text-sm font-black text-slate-800">プレイのカルテ</h1>
          <span className="w-10" />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {saved && (
          <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm font-bold text-green-800">
            カルテ内容を端末に保存しました（試験版）。本番では予約と一緒にCRMへ送信する予定です。
          </div>
        )}

        <p className="text-xs text-slate-500 leading-relaxed">
          事前にお好みやご希望をお伝えいただけるカルテです。現在は試験画面のため、内容はこの端末のブラウザにのみ一時保存されます。予約送信は
          <Link href="/funabashi/reserve" className="text-pink-600 font-bold underline mx-0.5">
            予約フォーム
          </Link>
          からお願いします。
        </p>

        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-pink-100 p-4 shadow-sm space-y-4">
          <label className="block">
            <span className="text-[10px] font-bold text-slate-500 mb-1 block">お好み・雰囲気</span>
            <textarea className={`${inputClass} min-h-[72px]`} name="preference" placeholder="例: 明るい雰囲気が好き" />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold text-slate-500 mb-1 block">NG・ご配慮事項</span>
            <textarea className={`${inputClass} min-h-[72px]`} name="ng" placeholder="例: 強い刺激は控えめに" />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold text-slate-500 mb-1 block">その他メモ</span>
            <textarea className={`${inputClass} min-h-[96px]`} name="memo" />
          </label>
          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold text-white bg-pink-500 hover:bg-pink-600"
          >
            カルテを保存（試験）
          </button>
        </form>
      </div>
    </main>
  )
}
