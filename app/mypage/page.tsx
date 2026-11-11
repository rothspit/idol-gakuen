'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function MyPage() {
  const [favorites, setFavorites] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchFavorites = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return window.location.href = '/login'
      setUser(user)

      const { data } = await supabase
        .from('favorites')
        .select(`girl_id, girls (*)`)
        .eq('user_id', user.id)

      if (data) setFavorites(data.map(f => f.girls))
    }
    fetchFavorites()
  }, [])

  if (!user) return <div className="p-8 text-center">ログインしてください</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-slate-800">💖 マイページ</h1>
        <a href="/funabashi" className="text-sm font-bold text-slate-500">トップへ戻る</a>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400">お気に入りがまだありません。</p>
          <a href="/funabashi" className="inline-block mt-4 bg-pink-500 text-white px-6 py-2 rounded-full font-bold">女の子を探す</a>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {favorites.map(girl => (
            <div key={girl.id} className="bg-white rounded-lg shadow overflow-hidden">
               <img src={girl.images?.[0]} className="aspect-[3/4] object-cover w-full" />
               <div className="p-2 text-center font-bold">{girl.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
