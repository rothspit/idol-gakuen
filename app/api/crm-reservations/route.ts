import { NextRequest, NextResponse } from 'next/server'
import { postIdolReservationToCrm } from '@/lib/crm-booking'
import {
  IDOL_STORE_NAME,
  type IdolReservationInput,
  toCrmReservePayload,
  validateIdolReservation,
} from '@/lib/idol-reservation'

async function notifyDiscord(payload: {
  input: IdolReservationInput
  crmOk: boolean
  crmSkipped?: boolean
  crmError?: string
  orderId?: string
  orderNumber?: string
}) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  const body = toCrmReservePayload(payload.input)
  const timeLabel =
    'in_time' in body && body.in_time ? String(body.in_time) : 'なるべく早め'

  const statusLine = payload.crmSkipped
    ? '⚠️ 試験モード（CRM未送信）'
    : payload.crmOk
      ? '✅ CRM登録済'
      : `⚠️ CRM登録失敗: ${payload.crmError ?? 'unknown'}`

  const discordMessage = {
    content: '🏬 **【ウェブ予約】**',
    embeds: [
      {
        color: payload.crmOk && !payload.crmSkipped ? 0x22c55e : 0xf59e0b,
        title: payload.orderNumber
          ? `受注: ${payload.orderNumber}`
          : payload.orderId
            ? `受注ID: ${payload.orderId}`
            : 'ウェブ予約',
        description: statusLine,
        fields: [
          { name: '店舗', value: payload.input.storeName, inline: true },
          {
            name: '電話',
            value: payload.input.phone.replace(/[^0-9]/g, ''),
            inline: true,
          },
          {
            name: '日時',
            value: `${payload.input.date} ${timeLabel}`,
            inline: true,
          },
          {
            name: 'コース',
            value: `${payload.input.courseMinutes}分（¥${payload.input.coursePriceYen.toLocaleString()}）`,
            inline: true,
          },
          {
            name: '指名',
            value:
              payload.input.nominationKind === 'free'
                ? 'フリー'
                : payload.input.castName || '指名あり',
            inline: true,
          },
          {
            name: '支払',
            value: payload.input.paymentMethod,
            inline: true,
          },
          ...(payload.orderNumber
            ? [{ name: 'CRM受注', value: payload.orderNumber, inline: true }]
            : []),
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  }

  if (!webhookUrl) {
    console.log('=== CRM予約（Discord未設定）===')
    return
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordMessage),
    })
    if (!res.ok) {
      console.error('Discord webhook error:', await res.text())
    }
  } catch (e) {
    console.error('Discord send error:', e)
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as Partial<IdolReservationInput>

    const input: IdolReservationInput = {
      phone: data.phone ?? '',
      date: data.date ?? '',
      time: data.time ?? '',
      courseMinutes: Number(data.courseMinutes) || 0,
      coursePriceYen: Number(data.coursePriceYen) || 0,
      nominationKind: data.nominationKind ?? 'free',
      castId: data.castId ?? null,
      castName: data.castName ?? null,
      locationKind: data.locationKind ?? 'hotel_business',
      locationDetail: data.locationDetail ?? '',
      address: data.address ?? '',
      isRepeater: Boolean(data.isRepeater),
      discountStick: data.discountStick ?? 'none',
      discountNote: data.discountNote ?? '',
      paymentMethod: data.paymentMethod ?? 'cash',
      customerNote: data.customerNote ?? '',
      storeName: data.storeName?.trim() || IDOL_STORE_NAME,
    }

    const validationError = validateIdolReservation(input)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const crmResult = await postIdolReservationToCrm(input)
    const crmSkipped =
      crmResult.ok && 'skipped' in crmResult && crmResult.skipped === true
    const crmOk = crmResult.ok && !crmSkipped
    const crmError =
      !crmResult.ok ? crmResult.error : crmSkipped ? 'dry-run' : undefined

    if (!crmOk && !crmSkipped) {
      console.error('CRM reserve failed:', crmError)
      // Optional Discord alert on failure (does not turn failure into success)
      await notifyDiscord({
        input,
        crmOk: false,
        crmSkipped: false,
        crmError,
      })
      return NextResponse.json(
        {
          error: crmError || 'CRMへの予約登録に失敗しました',
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
      crmOk,
      crmSkipped,
      crmError,
      orderId,
      orderNumber,
    })

    return NextResponse.json({
      success: true,
      message: crmSkipped
        ? '予約内容を受け付けました（試験モード）'
        : '予約内容をCRMに登録しました',
      crmRegistered: crmOk,
      orderId,
      orderNumber,
    })
  } catch (error) {
    console.error('CRM reservation API error:', error)
    return NextResponse.json(
      { error: '予約処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
