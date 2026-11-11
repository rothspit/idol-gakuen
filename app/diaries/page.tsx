import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

// 動的レンダリングを強制
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function DiariesPage() {
  // アイドル学園のブランドIDを取得
  const { data: brand } = await supabase
    .from('brands')
    .select('id')
    .eq('slug', 'idol-gakuen')
    .single()

  // アイドル学園の日記を新着順で取得
  let query = supabase
    .from('diaries')
    .select('*, girls(id, name, images)')
    .order('created_at', { ascending: false })
    .limit(50)

  if (brand) query = query.eq('brand_id', brand.id)

  const { data: diaries } = await query

  return (
    <main className="min-h-screen bg-gray-50 pb-20">

      {/* ヘッダー */}
      <header className="bg-white p-4 sticky top-0 z-10 shadow-sm flex items-center gap-4">
        <Link href="/funabashi" className="text-2xl text-gray-400 hover:text-gray-600">
          &larr;
        </Link>
        <h1 className="font-bold text-gray-800">📷 みんなの写メ日記</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {diaries && diaries.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {diaries.map((diary) => (
              <Link
                key={diary.id}
                href={`/diaries/${diary.id}`}
                className="block group cursor-pointer bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition"
              >
                <div className="aspect-square overflow-hidden relative">
                  {diary.images?.[0] || diary.image_url ? (
                    <img
                      src={diary.images?.[0] || diary.image_url}
                      alt={diary.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-2">
                    <span className="text-white text-[10px] font-bold">
                      {new Date(diary.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-pink-500 transition">
                    {diary.title}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                      {diary.girls?.images?.[0] ? (
                        <img src={diary.girls.images[0]} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full bg-gray-300" />
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{diary.girls?.name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">まだ写メ日記がありません</p>
          </div>
        )}

      </div>
    </main>
  )
}
