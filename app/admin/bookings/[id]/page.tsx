'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Booking {
  id: string
  user_name: string
  course_minutes: number
  course_name?: string
  course_price?: number
  requested_time: string
  phone_number: string
  status: 'pending' | 'confirmed' | 'negotiating' | 'rejected' | 'cancelled'
  proposal_data?: {
    new_time?: string
    original_time?: string
    message?: string
    proposed_at?: string
    adjust_minutes?: number
  }
  use_points: boolean
  cast_id?: string
  notes?: string
  created_at: string
  updated_at: string
}

const statusLabels: Record<string, string> = {
  pending: '保留中',
  confirmed: '確定',
  negotiating: '調整中',
  rejected: 'お断り',
  cancelled: 'キャンセル',
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-green-100 text-green-800 border-green-300',
  negotiating: 'bg-blue-100 text-blue-800 border-blue-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-300',
}

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 時間調整モーダル
  const [showTimeModal, setShowTimeModal] = useState(false)
  const [adjustMinutes, setAdjustMinutes] = useState(0)
  const [customMinutes, setCustomMinutes] = useState('')
  const [proposalMessage, setProposalMessage] = useState('')

  // 予約データ取得
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .single()

        if (error) throw error
        setBooking(data)
      } catch (e) {
        setError('予約データの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()

    // リアルタイム監視
    const channel = supabase
      .channel(`booking-${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `id=eq.${bookingId}`,
        },
        (payload) => {
          if (payload.new) {
            setBooking(payload.new as Booking)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [bookingId])

  // ステータス更新
  const updateStatus = async (newStatus: string, proposalData?: any) => {
    if (!booking) return
    setUpdating(true)

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          proposal_data: proposalData,
        }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error)

      setBooking(result.booking)
      setShowTimeModal(false)
    } catch (e: any) {
      setError(e.message || '更新に失敗しました')
    } finally {
      setUpdating(false)
    }
  }

  // 時間調整送信
  const submitTimeAdjustment = () => {
    if (!booking) return

    const totalMinutes = adjustMinutes || parseInt(customMinutes) || 0
    if (totalMinutes === 0) {
      setError('調整時間を選択してください')
      return
    }

    // 新しい時間を計算
    const [hours, mins] = booking.requested_time.split(':').map(Number)
    const totalMins = hours * 60 + mins + totalMinutes
    const newHours = Math.floor(totalMins / 60) % 24
    const newMins = totalMins % 60
    const newTime = `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`

    const message = proposalMessage || `${newTime}でしたらご案内可能です。いかがでしょうか？`

    updateStatus('negotiating', {
      new_time: newTime,
      message: message,
      original_time: booking.requested_time,
      adjust_minutes: totalMinutes,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">予約が見つかりません</p>
          <Link href="/admin/bookings" className="text-pink-500 hover:underline">
            ← 予約一覧に戻る
          </Link>
        </div>
      </div>
    )
  }

  const finalPrice = booking.course_price
    ? booking.course_price - (booking.use_points ? 2000 : 0)
    : 0

  return (
    <main className="min-h-screen bg-gray-100 pb-20">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/bookings" className="text-gray-400 hover:text-gray-600 text-xl">
              ←
            </Link>
            <div>
              <h1 className="font-bold text-gray-800">予約詳細</h1>
              <p className="text-xs text-gray-400">ID: {booking.id.slice(0, 8)}...</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-bold border ${statusColors[booking.status]}`}>
            {statusLabels[booking.status]}
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
            <button onClick={() => setError(null)} className="ml-2 text-red-500">×</button>
          </div>
        )}

        {/* 予約情報カード */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>📋</span> 予約内容
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">指名キャスト</p>
              <p className="font-bold text-lg text-pink-600">{booking.user_name}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">希望時間</p>
              <p className="font-bold text-lg">{booking.requested_time}〜</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">コース</p>
              <p className="font-bold">{booking.course_name || `${booking.course_minutes}分`}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">料金</p>
              <p className="font-bold text-lg">
                ¥{finalPrice.toLocaleString()}
                {booking.use_points && (
                  <span className="text-xs text-green-600 ml-1">(-2,000pt)</span>
                )}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 col-span-2">
              <p className="text-xs text-gray-500 mb-1">電話番号</p>
              <p className="font-bold text-lg">{booking.phone_number}</p>
              <a
                href={`tel:${booking.phone_number}`}
                className="inline-block mt-2 px-4 py-1 bg-green-500 text-white text-sm rounded-full hover:bg-green-600"
              >
                📞 電話する
              </a>
            </div>
          </div>

          {/* 提案中の内容 */}
          {booking.status === 'negotiating' && booking.proposal_data && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="font-bold text-blue-800 mb-2">🕒 時間調整を提案中</p>
              <p className="text-blue-700">
                <span className="line-through text-gray-400">{booking.proposal_data.original_time}</span>
                {' → '}
                <span className="font-bold">{booking.proposal_data.new_time}</span>
              </p>
              <p className="text-sm text-blue-600 mt-1">{booking.proposal_data.message}</p>
            </div>
          )}

          <div className="mt-4 text-xs text-gray-400">
            <p>受付日時: {new Date(booking.created_at).toLocaleString('ja-JP')}</p>
            <p>更新日時: {new Date(booking.updated_at).toLocaleString('ja-JP')}</p>
          </div>
        </div>

        {/* 操作パネル */}
        {booking.status === 'pending' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>⚡</span> アクション
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 確定 */}
              <button
                onClick={() => updateStatus('confirmed')}
                disabled={updating}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition disabled:opacity-50"
              >
                <span className="text-xl">✅</span>
                <span>確定する</span>
              </button>

              {/* 時間調整 */}
              <button
                onClick={() => setShowTimeModal(true)}
                disabled={updating}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition disabled:opacity-50"
              >
                <span className="text-xl">🕒</span>
                <span>時間調整</span>
              </button>

              {/* お断り */}
              <button
                onClick={() => {
                  if (confirm('この予約をお断りしますか？')) {
                    updateStatus('rejected')
                  }
                }}
                disabled={updating}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition disabled:opacity-50"
              >
                <span className="text-xl">❌</span>
                <span>お断り</span>
              </button>
            </div>
          </div>
        )}

        {/* 調整中の場合のアクション */}
        {booking.status === 'negotiating' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4">⏳ お客様の返答待ち</h2>
            <p className="text-gray-600 mb-4">提案した時間への返答をお待ちください。</p>
            <div className="flex gap-4">
              <button
                onClick={() => updateStatus('confirmed')}
                disabled={updating}
                className="px-6 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600"
              >
                ✅ 手動で確定
              </button>
              <button
                onClick={() => updateStatus('pending')}
                disabled={updating}
                className="px-6 py-3 bg-gray-500 text-white font-bold rounded-xl hover:bg-gray-600"
              >
                ↩️ 保留に戻す
              </button>
            </div>
          </div>
        )}

        {/* 完了メッセージ */}
        {booking.status === 'confirmed' && (
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6 text-center">
            <p className="text-4xl mb-2">🎉</p>
            <p className="font-bold text-green-700 text-xl">予約確定済み</p>
            <p className="text-green-600 mt-2">お客様への折り返し連絡をお願いします。</p>
          </div>
        )}

        {booking.status === 'rejected' && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 text-center">
            <p className="text-4xl mb-2">🙏</p>
            <p className="font-bold text-red-700 text-xl">お断り済み</p>
          </div>
        )}
      </div>

      {/* 時間調整モーダル */}
      {showTimeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span>🕒</span> 時間調整の提案
            </h3>

            <p className="text-gray-600 mb-4">
              現在の希望時間: <strong>{booking.requested_time}</strong>
            </p>

            {/* プリセットボタン */}
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">調整時間を選択:</p>
              <div className="flex flex-wrap gap-2">
                {[10, 20, 30, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      setAdjustMinutes(mins)
                      setCustomMinutes('')
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition ${
                      adjustMinutes === mins
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    +{mins}分
                  </button>
                ))}
              </div>
            </div>

            {/* カスタム入力 */}
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">または任意の分数:</p>
              <input
                type="number"
                value={customMinutes}
                onChange={(e) => {
                  setCustomMinutes(e.target.value)
                  setAdjustMinutes(0)
                }}
                placeholder="例: 25"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* 提案メッセージ */}
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">提案メッセージ（任意）:</p>
              <textarea
                value={proposalMessage}
                onChange={(e) => setProposalMessage(e.target.value)}
                placeholder="例: 19:30でしたらご案内可能です。"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 h-20 resize-none"
              />
            </div>

            {/* プレビュー */}
            {(adjustMinutes > 0 || customMinutes) && (
              <div className="mb-4 bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  提案時間:{' '}
                  <strong>
                    {(() => {
                      const totalMinutes = adjustMinutes || parseInt(customMinutes) || 0
                      const [hours, mins] = booking.requested_time.split(':').map(Number)
                      const totalMins = hours * 60 + mins + totalMinutes
                      const newHours = Math.floor(totalMins / 60) % 24
                      const newMins = totalMins % 60
                      return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`
                    })()}
                  </strong>
                </p>
              </div>
            )}

            {/* ボタン */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowTimeModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200"
              >
                キャンセル
              </button>
              <button
                onClick={submitTimeAdjustment}
                disabled={updating || (!adjustMinutes && !customMinutes)}
                className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 disabled:opacity-50"
              >
                {updating ? '送信中...' : '提案を送信'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
