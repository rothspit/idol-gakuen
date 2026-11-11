import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

// 動的レンダリングを強制
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function MoviesPage() {
  // 動画が含まれている日記だけを取得（配列が空じゃないやつ）
  const { data: movies } = await supabase
    .from('diaries')
    .select('*, girls(id, name, images)')
    .neq('videos', '{}')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* ヘッダー */}
      <header className="bg-white p-4 sticky top-0 z-10 shadow-sm flex items-center gap-4">
        <Link href="/funabashi" className="text-2xl text-gray-400 hover:text-gray-600">&larr;</Link>
        <h1 className="font-bold text-gray-800">🎬 動画ギャラリー</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {movies && movies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {movies.map((diary) => (
              <div key={diary.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* 動画プレイヤー (1つ目だけ表示) */}
                <div className="relative aspect-video bg-black">
                  <video
                    src={diary.videos[0]}
                    controls
                    preload="metadata"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* 下の説明エリア */}
                <div className="p-4">
                  <Link href={`/girls/${diary.girl_id}`} className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
                      {diary.girls?.images?.[0] ? (
                        <img src={diary.girls.images[0]} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full bg-gray-300" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-800">{diary.girls?.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(diary.created_at).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </Link>

                  <Link href={`/diaries/${diary.id}`}>
                    <p className="text-gray-700 text-sm font-bold truncate hover:text-pink-500 transition">
                      {diary.title || '無題の動画'}
                    </p>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-4">🎥</p>
            <p className="font-bold">動画はまだありません</p>
            <p className="text-sm mt-2">キャストからの投稿をお楽しみに！</p>
          </div>
        )}
      </div>
    </main>
  )
}
