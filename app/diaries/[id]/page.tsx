import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// 動的レンダリングを強制
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function DiaryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Next.js 15/16対応: paramsをawaitする
  const { id } = await params

  // 日記データ取得
  const { data: diary, error } = await supabase
    .from('diaries')
    .select('*, girls(*)')
    .eq('id', id)
    .single()

  // データが無い、またはエラーの場合は 404 画面へ
  if (error || !diary) {
    return notFound()
  }

  // HTMLから本文を抽出（BODYタグの中身だけ取得）
  const extractContent = (html: string) => {
    if (!html) return ''

    // <body>...</body>の中身を抽出
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    if (bodyMatch) {
      return bodyMatch[1]
    }

    // bodyタグがない場合はそのまま返す
    return html
  }

  // 本文を抽出
  const content = extractContent(diary.content || '')

  // 日付フォーマット
  const date = new Date(diary.created_at).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* ヘッダー */}
      <header className="bg-white p-4 sticky top-0 z-10 shadow-sm flex items-center gap-4">
        <Link href="/diaries" className="text-2xl text-gray-400 hover:text-gray-600">&larr;</Link>
        <h1 className="font-bold text-gray-800">写メ日記</h1>
      </header>

      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        {/* 投稿者情報 */}
        <div className="p-4 flex items-center gap-3 border-b border-gray-100">
          <Link href={`/girls/${diary.girl_id}`} className="block w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
            {diary.girls?.images?.[0] ? (
              <img src={diary.girls.images[0]} className="w-full h-full object-cover" alt="icon" />
            ) : <div className="w-full h-full bg-gray-300" />}
          </Link>
          <div>
            <Link href={`/girls/${diary.girl_id}`} className="font-bold text-gray-800 text-sm hover:underline">
              {diary.girls?.name}
            </Link>
            <p className="text-[10px] text-gray-400">{date}</p>
          </div>
        </div>

        {/* 日記画像 */}
        <div className="w-full bg-black">
          {diary.images?.[0] || diary.image_url ? (
            <img
              src={diary.images?.[0] || diary.image_url}
              className="w-full h-auto object-contain max-h-[600px] mx-auto"
              alt="diary"
            />
          ) : (
            <div className="aspect-square flex items-center justify-center text-gray-500">No Image</div>
          )}
        </div>

        {/* 動画エリア */}
        {diary.videos && diary.videos.length > 0 && (
          <div className="p-4 space-y-4">
            <h3 className="font-bold text-gray-700 text-sm flex items-center gap-1">
              <span>🎬</span> 動画
            </h3>
            {diary.videos.map((videoUrl: string, index: number) => (
              <video
                key={index}
                src={videoUrl}
                controls
                className="w-full rounded-lg shadow-md bg-black"
                preload="metadata"
              />
            ))}
          </div>
        )}

        {/* タイトルと本文 */}
        <div className="p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-4">{diary.title}</h2>

          {/* 本文があれば表示する（HTMLをレンダリング、絵文字対応） */}
          {content ? (
            <div
              className="text-gray-700 text-sm leading-relaxed diary-content"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <p className="text-gray-400 text-xs">本文はありません</p>
          )}

          {/* スタイル調整 */}
          <style>{`
            .diary-content p { margin-bottom: 1em; }
            .diary-content br { display: block; content: ""; margin-top: 0.5em; }
          `}</style>
        </div>

        {/* プロフィールへの誘導ボタン */}
        <div className="p-6 pt-0 mt-4">
          <Link href={`/girls/${diary.girl_id}`} className="block w-full bg-pink-500 text-white text-center font-bold py-4 rounded-xl shadow-lg hover:bg-pink-400 transition transform active:scale-95">
            この子のプロフィールを見る
          </Link>
        </div>
      </div>
    </main>
  )
}
