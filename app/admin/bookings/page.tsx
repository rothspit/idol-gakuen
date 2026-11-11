'use client'

import { useState, useEffect } from 'react'
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
  requested_time: string
  phone_number: string
  status: string
  created_at: string
}

const statusLabels: Record<string, string> = {
  pending: '保留中',
  confirmed: '確定',
  negotiating: '調整中',
  rejected: 'お断り',
  cancelled: 'キャンセル',
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  negotiating: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

export default function BookingsListPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    const fetchBookings = async () => {
      let query = supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query
      if (!error && data) {
        setBookings(data)
      }
      setLoading(false)
    }

    fetchBookings()

    // リアルタイム監視
    const channel = supabase
      .channel('bookings-list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        () => {
          fetchBookings()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [filter])

  const pendingCount = bookings.filter(b => b.status === 'pending').length

  return (
    <main className="min-h-screen bg-gray-100 pb-20">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-gray-400 hover:text-gray-600 text-xl">
              ←
            </Link>
            <div>
              <h1 className="font-bold text-gray-800">予約管理</h1>
              {pendingCount > 0 && (
                <p className="text-xs text-pink-500 font-bold">
                  🔔 {pendingCount}件の未処理予約
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* フィルター */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { value: 'all', label: 'すべて' },
            { value: 'pending', label: '🔴 保留中' },
            { value: 'negotiating', label: '🟡 調整中' },
            { value: 'confirmed', label: '🟢 確定' },
            { value: 'rejected', label: 'お断り' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${
                filter === f.value
                  ? 'bg-pink-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* リスト */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-500 border-t-transparent"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-4">📭</p>
            <p>予約がありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/admin/bookings/${booking.id}`}
                className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColors[booking.status]}`}>
                      {statusLabels[booking.status]}
                    </span>
                    <span className="font-bold text-pink-600">{booking.user_name}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(booking.created_at).toLocaleString('ja-JP', {
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>🕐 {booking.requested_time}〜</span>
                  <span>⏱ {booking.course_name || `${booking.course_minutes}分`}</span>
                  <span>📞 {booking.phone_number}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
