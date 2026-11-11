import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'

export const CHAT_SESSION_COOKIE = 'chat_sid'

const MAX_AGE_SEC = 60 * 60 * 24 * 30 // 30日

export async function getChatSessionId(): Promise<string | null> {
  const jar = await cookies()
  return jar.get(CHAT_SESSION_COOKIE)?.value ?? null
}

export async function ensureChatSessionId(): Promise<string> {
  const existing = await getChatSessionId()
  if (existing) return existing

  const id = randomUUID()
  const jar = await cookies()
  jar.set(CHAT_SESSION_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SEC,
  })
  return id
}
