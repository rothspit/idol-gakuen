import { toCrmReservePayload, type IdolReservationInput } from '@/lib/idol-reservation'

export type CrmBookingResult =
  | { ok: true; orderId?: string; orderNumber?: string; raw?: unknown }
  | { ok: false; error: string; status?: number; raw?: unknown }
  | { ok: true; skipped: true; reason: string }

/**
 * Resolve CRM API base URL ending in `/api`.
 * Prefer NEXT_PUBLIC_CRM_API_URL when it already ends with `/api`.
 * If CRM_API_URL lacks `/api`, append it so we never POST to `/reserve` (must be `/api/reserve`).
 */
export function getCrmBaseUrl() {
  const nextPublic = (process.env.NEXT_PUBLIC_CRM_API_URL || '').trim().replace(/\/+$/, '')
  const crmApi = (process.env.CRM_API_URL || '').trim().replace(/\/+$/, '')

  let base: string
  if (nextPublic.endsWith('/api')) {
    base = nextPublic
  } else if (crmApi) {
    base = crmApi.endsWith('/api') ? crmApi : `${crmApi}/api`
  } else if (nextPublic) {
    base = nextPublic.endsWith('/api') ? nextPublic : `${nextPublic}/api`
  } else {
    base = 'https://crm.h-mitsu.com/api'
  }

  if (!base.endsWith('/api')) {
    base = `${base}/api`
  }

  return base
}

function getReserveSecret() {
  return process.env.RESERVE_SYNC_SECRET || process.env.CRM_RESERVE_SYNC_SECRET || ''
}

export async function postIdolReservationToCrm(
  input: IdolReservationInput
): Promise<CrmBookingResult> {
  if (process.env.CRM_BOOKING_DRY_RUN === 'true') {
    return {
      ok: true,
      skipped: true,
      reason: 'CRM_BOOKING_DRY_RUN',
    }
  }

  const secret = getReserveSecret()
  if (!secret) {
    return {
      ok: false,
      error: 'RESERVE_SYNC_SECRET が未設定です',
    }
  }

  const url = `${getCrmBaseUrl()}/reserve`
  // Guard: never hit host-root /reserve
  if (!url.includes('/api/reserve')) {
    return {
      ok: false,
      error: `不正なCRM予約URLです（/api/reserve 必須）`,
    }
  }

  const body = toCrmReservePayload(input)

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-sync-secret': secret,
      },
      body: JSON.stringify(body),
    })

    const text = await res.text()
    let parsed: unknown = text
    try {
      parsed = text ? JSON.parse(text) : null
    } catch {
      /* plain text */
    }

    if (!res.ok) {
      const errMsg =
        typeof parsed === 'object' &&
        parsed !== null &&
        'error' in parsed &&
        typeof (parsed as { error: unknown }).error === 'string'
          ? (parsed as { error: string }).error
          : `CRM API error (${res.status})`
      return {
        ok: false,
        error: errMsg,
        status: res.status,
        raw: parsed,
      }
    }

    const record =
      typeof parsed === 'object' && parsed !== null
        ? (parsed as Record<string, unknown>)
        : {}

    return {
      ok: true,
      orderId:
        record.order_id != null ? String(record.order_id) : undefined,
      orderNumber:
        record.order_number != null ? String(record.order_number) : undefined,
      raw: parsed,
    }
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'CRM connection failed',
    }
  }
}

export function formatReservationForDiscord(
  input: IdolReservationInput,
  meta?: { crmOk?: boolean; crmError?: string; orderId?: string }
) {
  const body = toCrmReservePayload(input)
  const timeLabel =
    'in_time' in body && body.in_time
      ? String(body.in_time)
      : 'なるべく早め'
  const lines = [
    '🏬 **【ウェブ予約】**',
    `店舗ID: ${body.store_id}`,
    `📞 ${body.customer_phone}`,
    `📅 ${body.date} ${timeLabel}`,
    `⏱ ${body.course_minutes}分（¥${Number(body.course_price).toLocaleString()}）`,
    `指名: ${body.nomination_type}${body.cast_name ? ` — ${body.cast_name}` : ''}`,
    `場所: ${body.place_type}${body.place_detail ? ` / ${body.place_detail}` : ''}`,
    `支払: ${body.payment_method}`,
    body.notes ? `📝 ${body.notes}` : null,
    meta?.orderId ? `受注ID: ${meta.orderId}` : null,
    meta?.crmOk === false ? `⚠️ CRM登録失敗: ${meta.crmError}` : null,
    meta?.crmOk === true ? '✅ CRM受注登録済' : null,
  ].filter(Boolean)

  return lines.join('\n')
}
