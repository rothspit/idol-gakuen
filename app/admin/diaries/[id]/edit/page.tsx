import { createClient } from '@supabase/supabase-js'
import { updateDiary } from '@/app/actions'
import { notFound } from 'next/navigation'
import Link from 'next/link'

// 動的レンダリングを強制
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function EditDiaryPage({ params }: { params: Promise<{ id: string }> }) {
  // Next.js 16対応: paramsをawaitする
  const { id } = await params

  // 編集する日記のデータを取得
  const { data: diary } = await supabase
    .from('diaries')
    .select('*')
    .eq('id', id)
    .single()

  if (!diary) return notFound()

  // Server ActionにIDを埋め込む
  const updateDiaryWithId = updateDiary.bind(null, diary.id)

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* ヘッダー */}
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-10 shadow-sm flex items-center gap-4">
        <Link href="/admin" className="text-2xl text-slate-400 hover:text-white">&larr;</Link>
        <h1 className="font-bold">日記の編集</h1>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        <form action={updateDiaryWithId} className="space-y-4">
          {/* タイトル編集 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
            <input
              name="title"
              defaultValue={diary.title}
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="タイトルを入力"
            />
          </div>

          {/* 本文編集 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">本文</label>
            <textarea
              name="content"
              defaultValue={diary.content}
              rows={10}
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="ここに本文を追記できます"
            />
          </div>

          {/* 保存ボタン */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-pink-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-pink-600 transition"
            >
              保存して更新
            </button>

            <Link
              href="/admin"
              className="px-6 py-3 text-gray-500 hover:text-gray-700"
            >
              キャンセル
            </Link>
          </div>
        </form>

        {/* 現在の画像プレビュー（編集不可） */}
        {diary.images && diary.images.length > 0 && (
          <div className="mt-8">
            <p className="mb-2 font-bold text-gray-700">添付されている画像:</p>
            <div className="flex gap-2 flex-wrap">
              {diary.images.map((img: string, i: number) => (
                <img key={i} src={img} alt="preview" className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
