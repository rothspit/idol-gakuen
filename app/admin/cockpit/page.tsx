'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 委員長設定の型
interface LeaderConfig {
  castId: string
  castName: string
  dereMessage: string
  appointedAt: string
}

const DEFAULT_DERE_MESSAGE = 'えっ…私！？\n他の子じゃなくて……いいの？\n\n……そっか。うん、\n放課後、特別室で待ってるからね❤️（//）'

export default function CockpitPage() {
  const [casts, setCasts] = useState<any[]>([])
  const [currentLeader, setCurrentLeader] = useState<LeaderConfig | null>(null)
  const [editingMessage, setEditingMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // 初期化: キャストデータと現在の委員長設定を読み込む
  useEffect(() => {
    // キャスト一覧を取得
    const fetchCasts = async () => {
      const { data } = await supabase
        .from('girls')
        .select('*')
        .order('ranking_order', { ascending: true })
      if (data) setCasts(data)
    }
    fetchCasts()

    // LocalStorageから現在の委員長設定を読み込む
    const savedConfig = localStorage.getItem('leader_config')
    if (savedConfig) {
      const config = JSON.parse(savedConfig) as LeaderConfig
      setCurrentLeader(config)
      setEditingMessage(config.dereMessage)
    }
  }, [])

  // 画像URLを取得
  const getImageUrl = (girl: any) => {
    if (girl?.images && girl.images[0]) return girl.images[0]
    if (girl?.image1_url) return girl.image1_url
    return null
  }

  // 委員長を任命
  const appointLeader = (cast: any) => {
    const config: LeaderConfig = {
      castId: cast.id,
      castName: cast.name,
      dereMessage: editingMessage || DEFAULT_DERE_MESSAGE,
      appointedAt: new Date().toISOString(),
    }
    localStorage.setItem('leader_config', JSON.stringify(config))
    setCurrentLeader(config)

    // 成功メッセージ
    setSuccessMessage(`${cast.name}ちゃんを学級委員長に任命しました！`)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  // デレメッセージを保存
  const saveDereMessage = () => {
    if (!currentLeader) return
    const config: LeaderConfig = {
      ...currentLeader,
      dereMessage: editingMessage,
    }
    localStorage.setItem('leader_config', JSON.stringify(config))
    setCurrentLeader(config)

    setSuccessMessage('スペシャルメッセージを保存しました！')
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  // 委員長を解任
  const removeLeader = () => {
    localStorage.removeItem('leader_config')
    setCurrentLeader(null)
    setEditingMessage(DEFAULT_DERE_MESSAGE)

    setSuccessMessage('学級委員長を解任しました')
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  // 現在の委員長のキャストデータ
  const currentLeaderCast = casts.find(c => c.id === currentLeader?.castId)

  return (
    <main className="min-h-screen bg-slate-900 text-white pb-20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;700;800&display=swap');
        .font-rounded { font-family: 'M PLUS Rounded 1c', sans-serif; }
      `}</style>

      {/* 成功トースト */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-full shadow-xl font-bold"
          >
            ✓ {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ヘッダー */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-slate-400 hover:text-white text-xl">&larr;</Link>
            <div>
              <h1 className="font-rounded font-bold text-xl">🎮 店長コックピット</h1>
              <p className="text-xs text-slate-400">日直・学級委員長 任命コンソール</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-green-400">システム稼働中</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">

        {/* ========== 現在の委員長セクション ========== */}
        <section className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-2xl p-6 border border-slate-700">
          <h2 className="font-rounded font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">👑</span> 現在の学級委員長
          </h2>

          {currentLeader && currentLeaderCast ? (
            <div className="flex flex-col md:flex-row gap-6">
              {/* 委員長プロフィール */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-yellow-500 shadow-lg shadow-yellow-500/30">
                    {getImageUrl(currentLeaderCast) ? (
                      <img src={getImageUrl(currentLeaderCast)} alt={currentLeaderCast.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-700 flex items-center justify-center text-5xl">👧</div>
                    )}
                  </div>
                  {/* 任命バッジ */}
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 text-[10px] font-black px-2 py-1 rounded-full shadow-lg animate-bounce">
                    任命・稼働中
                  </div>
                </div>
              </div>

              {/* 委員長情報 */}
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-3xl font-rounded font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300">
                    {currentLeaderCast.name}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    {currentLeaderCast.catch_copy || '学級委員長'}
                  </p>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                  <p className="text-[10px] text-slate-500 mb-1">任命日時</p>
                  <p className="text-sm text-slate-300">
                    {new Date(currentLeader.appointedAt).toLocaleString('ja-JP')}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={removeLeader}
                    className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/50 rounded-lg text-sm font-bold hover:bg-red-600/30 transition"
                  >
                    解任する
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <p className="text-5xl mb-4">🪑</p>
              <p className="font-bold">学級委員長が任命されていません</p>
              <p className="text-sm mt-2">下のリストからキャストを選んでください</p>
            </div>
          )}
        </section>

        {/* ========== スペシャルメッセージ編集 ========== */}
        <section className="bg-gradient-to-br from-pink-900/30 to-slate-800 rounded-2xl p-6 border border-pink-500/30">
          <h2 className="font-rounded font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">💕</span> スペシャルメッセージ（デレ台詞）
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            ユーザーが学級委員長を指名した時に表示される特別メッセージです。
          </p>

          <textarea
            value={editingMessage}
            onChange={(e) => setEditingMessage(e.target.value)}
            placeholder={DEFAULT_DERE_MESSAGE}
            className="w-full h-40 bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white font-rounded text-sm resize-none focus:outline-none focus:border-pink-500 transition"
          />

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setEditingMessage(DEFAULT_DERE_MESSAGE)}
              className="text-sm text-slate-400 hover:text-white underline"
            >
              デフォルトに戻す
            </button>
            <button
              onClick={saveDereMessage}
              disabled={!currentLeader}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-lg shadow-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              メッセージを保存
            </button>
          </div>
        </section>

        {/* ========== 候補者リスト ========== */}
        <section>
          <h2 className="font-rounded font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">📋</span> 候補者リスト（在籍キャスト）
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {casts.map((cast) => {
              const isCurrentLeader = currentLeader?.castId === cast.id
              return (
                <motion.div
                  key={cast.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative bg-slate-800 rounded-xl overflow-hidden border-2 transition-all ${
                    isCurrentLeader
                      ? 'border-yellow-500 ring-2 ring-yellow-500/30'
                      : 'border-slate-700 hover:border-pink-500'
                  }`}
                >
                  {/* 委員長バッジ */}
                  {isCurrentLeader && (
                    <div className="absolute top-2 left-2 z-10 bg-yellow-500 text-slate-900 text-[8px] font-black px-2 py-1 rounded-full">
                      👑 現・委員長
                    </div>
                  )}

                  {/* 写真 */}
                  <div className="aspect-[3/4] bg-slate-700 relative">
                    {getImageUrl(cast) ? (
                      <img src={getImageUrl(cast)} alt={cast.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">👧</div>
                    )}
                    {/* 出勤状態 */}
                    <div className={`absolute top-2 right-2 text-[8px] font-bold px-2 py-1 rounded-full ${
                      cast.is_attending ? 'bg-green-500 text-white' : 'bg-slate-600 text-slate-300'
                    }`}>
                      {cast.is_attending ? '出勤中' : '休み'}
                    </div>
                  </div>

                  {/* 情報 */}
                  <div className="p-3">
                    <p className="font-rounded font-bold text-white truncate">{cast.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{cast.catch_copy || 'キャスト'}</p>

                    {/* 任命ボタン */}
                    <button
                      onClick={() => appointLeader(cast)}
                      disabled={isCurrentLeader}
                      className={`w-full mt-3 py-2 rounded-lg font-bold text-xs transition ${
                        isCurrentLeader
                          ? 'bg-yellow-500/20 text-yellow-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90 active:scale-95'
                      }`}
                    >
                      {isCurrentLeader ? '現在の委員長' : 'この子を任命する'}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* ========== 使い方ガイド ========== */}
        <section className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
          <h2 className="font-rounded font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">📖</span> 使い方ガイド
          </h2>
          <div className="space-y-4 text-sm text-slate-400">
            <div className="flex gap-3">
              <span className="w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
              <p>上のリストから「学級委員長」に任命したいキャストを選びます。</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
              <p>任命すると、サイトのチャットボット（放課後コンシェルジュ）のアイコンと名前が自動で切り替わります。</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
              <p>ユーザーがその子を指名すると「ハートの紙吹雪 + デレ台詞」の特別演出が発動します。</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
              <p>「スペシャルメッセージ」欄で、デレ台詞を自由にカスタマイズできます。</p>
            </div>
          </div>
        </section>

      </div>
    </main>
  )
}
