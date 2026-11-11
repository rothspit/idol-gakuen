import { NextRequest, NextResponse } from 'next/server'
import { postIdolReservationToCrm } from '@/lib/crm-booking'
import {
  IDOL_STORE_NAME,
  type IdolReservationInput,
  toCrmReservePayload,
  validateIdolReservation,
} from '@/lib/idol-reservation'
import { getBusinessTodayString } from '@/lib/business-date'

interface CreateBookingRequest {
  cast: {
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
  usePoints: boolean
  storeName: string
}

function mapToIdolReservation(data: CreateBookingRequest): IdolReservationInput {
  const courseMinutes =
    parseInt(String(data.course?.time ?? '').replace(/[^0-9]/g, ''), 10) || 60
  const price = Number(data.course?.price) || 0
  const finalPrice = data.usePoints ? Math.max(0, price - 2000) : price

  const start = String(data.startTime || '').trim()
  const nextDay = /翌/.test(start)
  const timeOnly = start.replace(/（翌）/g, '').replace(/翌/g, '').trim() || 'asap'

  let date = getBusinessTodayString()
  if (nextDay) {
    const d = new Date(`${date}T12:00:00`)
    d.setDate(d.getDate() + 1)
    date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const noteParts: string[] = []
  if (data.usePoints) noteParts.push('会員ポイント2,000pt利用希望')
  if (data.course?.name) noteParts.push(`コース名: ${data.course.name}`)

  return {
    phone: data.phone,
    date,
    // date already advanced when label had 翌 — do not re-prefix （翌）
    time: timeOnly,
    courseMinutes,
    coursePriceYen: finalPrice,
    nominationKind: 'photo',
    castId: data.cast?.id != null ? String(data.cast.id) : null,
    castName: data.cast?.name?.trim() || null,
    locationKind: 'other',
    locationDetail: 'ウェブ予約（詳細は確認時）',
    address: '',
    isRepeater: false,
    discountStick: data.usePoints ? 'other' : 'none',
    discountNote: data.usePoints ? 'ポイント2,000pt' : '',
    paymentMethod: 'cash',
    customerNote: noteParts.join('\n'),
    storeName: data.storeName?.trim() || IDOL_STORE_NAME,
  }
}

async function notifyDiscord(opts: {
  input: IdolReservationInput
  orderId?: string
  orderNumber?: string
  crmSkipped?: boolean
}) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  const body = toCrmReservePayload(opts.input)
  const timeLabel =
    'in_time' in body && body.in_time ? String(body.in_time) : 'なるべく早め'

  const discordMessage = {
    content: '🚨 **新規予約リクエスト（CRM直送）** 🚨',
    embeds: [
      {
        color: opts.crmSkipped ? 0xf59e0b : 0x22c55e,
        title: opts.orderNumber
          ? `受注: ${opts.orderNumber}`
          : opts.orderId
            ? `受注ID: ${opts.orderId}`
            : 'ウェブ予約',
        description: opts.crmSkipped
          ? '⚠️ 試験モード（CRM未送信）'
          : '✅ CRM登録済',
        fields: [
          { name: '🏬 店舗名', value: opts.input.storeName, inline: true },
          {
            name: '👸 指名キャスト',
            value: opts.input.castName || 'フリー',
            inline: true,
          },
          {
            name: '⏱ コース',
            value: `${opts.input.courseMinutes}分（¥${opts.input.coursePriceYen.toLocaleString()}）`,
            inline: true,
          },
          {
            name: '🕐 希望時間',
            value: `${opts.input.date} ${timeLabel}`,
            inline: true,
          },
          {
            name: '📞 電話番号',
            value: opts.input.phone.replace(/[^0-9]/g, ''),
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  }

  if (!webhookUrl) {
    console.log('=== Discord通知（Webhook未設定）===')
    return
  }

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
}

export async function POST(request: NextRequest) {
  try {
    const data: CreateBookingRequest = await request.json()

    const storeName = data.storeName?.trim()
    if (!storeName || !data.cast?.name || !data.startTime || !data.phone) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      )
    }

    const input = mapToIdolReservation({ ...data, storeName })
    const validationError = validateIdolReservation(input)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const crmResult = await postIdolReservationToCrm(input)
    const crmSkipped =
      crmResult.ok && 'skipped' in crmResult && crmResult.skipped === true
    const crmOk = crmResult.ok && !crmSkipped

    if (!crmOk && !crmSkipped) {
      console.error('CRM reserve failed:', crmResult.ok === false ? crmResult.error : 'unknown')
      return NextResponse.json(
        {
          error:
            crmResult.ok === false
              ? crmResult.error
              : 'CRMへの予約登録に失敗しました',
          crmRegistered: false,
        },
        { status: 502 }
      )
    }

    const orderId =
      crmOk && 'orderId' in crmResult ? crmResult.orderId : undefined
    const orderNumber =
      crmOk && 'orderNumber' in crmResult ? crmResult.orderNumber : undefined

    await notifyDiscord({
      input,
      orderId,
      orderNumber,
      crmSkipped,
    })

    return NextResponse.json({
      success: true,
      message: crmSkipped
        ? '予約内容を受け付けました（試験モード）'
        : '予約リクエストをCRMに登録しました',
      bookingId: orderId || orderNumber,
      orderId,
      orderNumber,
      crmRegistered: crmOk,
    })
  } catch (error) {
    console.error('Booking API error:', error)
    return NextResponse.json(
      { error: '予約処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    {
      error:
        '予約一覧はSupabase経由では提供していません。CRM管理画面で確認してください。',
    },
    { status: 410 }
  )
}
