'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function DiarySection({ brandSlug, storeId = 2 }: { brandSlug?: string, storeId?: number }) {
  const [diaries, setDiaries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getDiaries() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_CRM_API_URL || 'https://crm.h-mitsu.com/api'
        const res = await fetch(`${baseUrl}/idol/diaries?store_id=${storeId}`, {
          cache: 'no-store'
        })
        if (!res.ok) throw new Error('API Error')
        
        const data = await res.json()
        setDiaries(data.diaries || [])
      } catch (err) {
        console.error('Failed to fetch diaries:', err)
      } finally {
        setLoading(false)
      }
    }
    getDiaries()
  }, [storeId])

  // 日記がまだなければ何も表示しない
  if (!loading && (!diaries || diaries.length === 0)) return null

  if (loading) return null

  return (
    <div className="max-w-2xl mx-auto px-4 my-6">
      {/* タイトル */}
      <h2 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
        📷 写メ日記 <span className="text-[10px] font-bold text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100 animate-pulse">New Posts</span>
      </h2>

      {/* Instagram風 横スクロールカルーセル */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x px-2">
        {diaries.map((diary: any) => (
          <Link href={`/diaries/${diary.id}`} key={diary.id} className="min-w-[160px] w-[160px] flex-shrink-0 snap-start block">

            {/* 画像エリア */}
            <div className="aspect-[4/5] bg-slate-200 rounded-xl overflow-hidden mb-2 relative border border-slate-100 shadow-sm group">
              {diary.image ? (
                <Image 
                  src={diary.image} 
                  alt={diary.title || 'Diary Image'}
                  fill
                  quality={95}
                  sizes="(max-width: 768px) 160px, 200px"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">No Image</div>
              )}

              {/* アイコン重ね（誰の日記かわかるように） - 現在のAPI構成では本人の画像を別で取れないため頭文字を利用 */}
              <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-slate-300 shadow-lg z-10 flex items-center justify-center bg-pink-100 text-sm text-pink-500 font-black">
                 {diary.cast_name?.charAt(0) || '?'}
              </div>
            </div>

            {/* テキストエリア */}
            <p className="text-xs font-bold text-slate-700 truncate">{diary.title || '無題'}</p>
            <div className="flex justify-between items-center mt-0.5">
               <p className="text-[10px] text-pink-500 font-bold truncate">{diary.cast_name}</p>
               <p className="text-[10px] text-slate-400">
                  {diary.posted_at ? new Date(diary.posted_at).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }) : ''}
               </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
