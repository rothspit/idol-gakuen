function crmApiRoot(): string {
  const raw = (process.env.CRM_API_URL || process.env.NEXT_PUBLIC_CRM_API_URL || 'https://crm.h-mitsu.com/api').trim()
  const base = raw.replace(/\/$/, '')
  return /\/api$/i.test(base) ? base : `${base}/api`
}

const TOKEN_RE = /^[A-Za-z0-9]{32,64}$/

export const IDOL_DEFAULT_STORE_CODE = 'idol_funabashi'

export type IdolChatSource = 'guest' | 'recruit' | 'staff_recruit'

export function isValidChatToken(token: string): boolean {
  return TOKEN_RE.test(token)
}

function syncSecret(): string {
  return process.env.RESERVE_SYNC_SECRET?.trim() || process.env.CRM_RESERVE_SYNC_SECRET?.trim() || process.env.CRM_RESERVE_SECRET?.trim() || ''
}

function crmChatUrl(path: string): string {
  return `${crmApiRoot()}/idol/chat${path}`
}

async function parseJson(res: Response) {
  return res.json().catch(() => ({}))
}

export async function startIdolChat(payload: {
  store_code?: string
  phone?: string
  name?: string
  source?: IdolChatSource
}) {
  const secret = syncSecret()
  if (!secret) throw new Error('RESERVE_SYNC_SECRET not configured')

  const res = await fetch(crmChatUrl('/start'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-sync-secret': secret,
    },
    body: JSON.stringify({
      store_code: payload.store_code || IDOL_DEFAULT_STORE_CODE,
      ...(payload.phone ? { phone: payload.phone } : {}),
      ...(payload.name ? { name: payload.name } : {}),
      ...(payload.source ? { source: payload.source } : {}),
    }),
    cache: 'no-store',
  })
  const body = await parseJson(res)
  if (!res.ok || !body.success) {
    throw new Error(body.error || `chat_start_failed_${res.status}`)
  }
  return body
}

export async function resumeIdolChat(payload: {
  phone: string
  source?: IdolChatSource
}) {
  const secret = syncSecret()
  if (!secret) throw new Error('RESERVE_SYNC_SECRET not configured')

  const res = await fetch(crmChatUrl('/resume'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-sync-secret': secret,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })
  const body = await parseJson(res)
  if (!res.ok || !body.success) {
    const err = new Error(body.error || `chat_resume_failed_${res.status}`) as Error & {
      status?: number
    }
    err.status = res.status
    throw err
  }
  return body
}

export async function fetchIdolChat(token: string, phone?: string) {
  const q =
    phone && phone.replace(/\D/g, '').length >= 10
      ? `?phone=${encodeURIComponent(phone.replace(/\D/g, ''))}`
      : ''
  const res = await fetch(`${crmChatUrl(`/${encodeURIComponent(token)}`)}${q}`, {
    cache: 'no-store',
  })
  const body = await parseJson(res)
  if (!res.ok || !body.success) {
    const err = new Error(body.error || `chat_fetch_failed_${res.status}`) as Error & {
      status?: number
    }
    err.status = res.status
    throw err
  }
  return body
}

export async function sendIdolChatMessage(token: string, message: string, phone?: string) {
  const res = await fetch(crmChatUrl(`/${encodeURIComponent(token)}/messages`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      ...(phone ? { phone } : {}),
    }),
  })
  const body = await parseJson(res)
  if (!res.ok || !body.success) {
    throw new Error(body.error || `chat_send_failed_${res.status}`)
  }
  return body
}

export async function heartbeatIdolChat(token: string, phone?: string) {
  const res = await fetch(crmChatUrl(`/${encodeURIComponent(token)}/heartbeat`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(phone ? { phone } : {}),
    cache: 'no-store',
  })
  const body = await parseJson(res)
  if (!res.ok || !body.success) {
    throw new Error(body.error || `chat_heartbeat_failed_${res.status}`)
  }
  return body
}
