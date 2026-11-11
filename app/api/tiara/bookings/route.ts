import { NextRequest, NextResponse } from 'next/server'
import { supabaseTiara } from '@/lib/supabase-tiara'

// 予約作成リクエストの型
interface CreateBookingRequest {
  therapist: {
    id: string
    name: string
  }
  course: {
    name: string
    time: string
    price: number
  }
  startTime: string
  phone: string
  usePoints?: boolean
  storeName: string
}

// POST: 新規予約作成
export async function POST(request: NextRequest) {
  try {
    const data: CreateBookingRequest = await request.json()

    // バリデーション
    const storeName = data.storeName?.trim()

    if (!storeName || !data.therapist?.name || !data.startTime || !data.phone) {
      return NextResponse.json(
        { error: '必須項目が不足しております' },
        { status: 400 }
      )
    }

    // コース時間を分に変換
    const courseMinutes = parseInt(data.course.time.replace(/[^0-9]/g, '')) || 60

    // Supabaseに予約を保存
    const { data: booking, error } = await supabaseTiara
      .from('bookings')
      .insert({
        therapist_name: data.therapist.name,
        course_name: data.course.name,
        course_minutes: courseMinutes,
        course_price: data.course.price,
        requested_time: data.startTime,
        phone_number: data.phone,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: 'データベースエラーが発生いたしました' },
        { status: 500 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://idolgakuen.jp'
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL_TIARA || process.env.DISCORD_WEBHOOK_URL
    const finalPrice = data.usePoints ? data.course.price - 2000 : data.course.price

    const discordMessage = {
      content: `✨ **【${storeName}】新規指名予約** ✨`,
      embeds: [
        {
          color: 0xd4af37,
          title: `予約番号: ${booking.id.slice(0, 8).toUpperCase()}`,
          fields: [
            { name: '🏬 店舗名', value: storeName, inline: true },
            { name: '👸 ご指名セラピスト', value: data.therapist.name, inline: true },
            { name: '💎 コース', value: `${data.course.name}（${data.course.time}）`, inline: true },
            { name: '🕐 ご希望時間', value: data.startTime, inline: true },
            { name: '📞 ご連絡先', value: data.phone, inline: true },
            { name: '💰 料金', value: `¥${finalPrice.toLocaleString()}`, inline: true },
          ],
          footer: { text: '⬇️ 管理画面よりご確認ください' },
          timestamp: new Date().toISOString(),
        },
      ],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 5,
              label: '📋 管理画面を開く',
              url: `${baseUrl}/admin/tiara/bookings/${booking.id}`,
            },
          ],
        },
      ],
    }

    if (webhookUrl) {
      try {
        const discordResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(discordMessage),
        })
        if (!discordResponse.ok) {
          console.error('Discord webhook error:', await discordResponse.text())
        }
      } catch (e) {
        console.error('Discord send error:', e)
      }
    } else {
      console.log('=== THE TIARA Discord通知（Webhook未設定）===')
      console.log(JSON.stringify(discordMessage, null, 2))
    }

    return NextResponse.json({
      success: true,
      message: 'ご予約リクエストを承りました',
      bookingId: booking.id,
    })

  } catch (error) {
    console.error('Booking API error:', error)
    return NextResponse.json(
      { error: '予約処理中にエラーが発生いたしました' },
      { status: 500 }
    )
  }
}

// GET: 予約一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabaseTiara
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: bookings, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ bookings })

  } catch (error) {
    console.error('GET bookings error:', error)
    return NextResponse.json(
      { error: '予約一覧の取得に失敗いたしました' },
      { status: 500 }
    )
  }
}
