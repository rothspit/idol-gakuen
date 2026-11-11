'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

const POLL_MS = 20000
const HEARTBEAT_MS = 30000
const ACCENT = '#d4527a'

type ChatSource = 'guest' | 'recruit' | 'staff_recruit'

const RESERVE_STORES = [
  { code: 'idol_funabashi', pathPrefixes: ['/funabashi', '/girls', '/schedule'] },
  { code: 'idol_makuhari', pathPrefixes: ['/makuhari'] },
  { code: 'idol_akiba', pathPrefixes: ['/akiba'] },
] as const

function storeCodeFromPath(pathname: string | null): string {
  if (!pathname) return 'idol_funabashi'
  const matched = RESERVE_STORES.find((store) =>
    store.pathPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)),
  )
  return matched?.code ?? 'idol_funabashi'
}

function chatSourceFromPath(pathname: string | null): ChatSource {
  if (!pathname) return 'guest'
  if (pathname.includes('/recruit/staff')) return 'staff_recruit'
  if (pathname.includes('/recruit')) return 'recruit'
  return 'guest'
}

function storageKeys(source: ChatSource) {
  const suffix = source === 'guest' ? '' : `_${source}`
  return {
    token: `idol_guest_chat_token${suffix}`,
    phone: `idol_guest_chat_phone${suffix}`,
  }
}

type ChatMessage = {
  id: number
  sender_type: string
  message: string
  created_at: string
  is_read?: boolean
  read_at?: string | null
}

type ChatPayload = {
  success?: boolean
  access_token?: string
  guest_display_name?: string | null
  phone?: string | null
  store?: { label?: string }
  messages?: ChatMessage[]
}

function digitsOnly(phone: string): string {
  return phone.replace(/[^0-9]/g, '')
}

function readStored(source: ChatSource): { token: string | null; phone: string | null } {
  try {
    const keys = storageKeys(source)
    const token = localStorage.getItem(keys.token)
    const phone = localStorage.getItem(keys.phone)
    return {
      token: token && token.length >= 32 ? token : null,
      phone: phone && digitsOnly(phone).length >= 10 ? phone : null,
    }
  } catch {
    return { token: null, phone: null }
  }
}

function writeStored(source: ChatSource, token: string, phone?: string | null) {
  try {
    const keys = storageKeys(source)
    localStorage.setItem(keys.token, token)
    const d = phone ? digitsOnly(phone) : ''
    if (d.length >= 10) {
      localStorage.setItem(keys.phone, d)
    } else {
      localStorage.removeItem(keys.phone)
    }
  } catch {
    /* ignore */
  }
}

function clearStored(source: ChatSource) {
  try {
    const keys = storageKeys(source)
    localStorage.removeItem(keys.token)
    localStorage.removeItem(keys.phone)
  } catch {
    /* ignore */
  }
}

function formatReadAt(iso?: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function IdolStaffChatWidget() {
  const pathname = usePathname()
  const pathSource = useMemo(() => chatSourceFromPath(pathname), [pathname])
  const storeCode = useMemo(() => storeCodeFromPath(pathname), [pathname])
  const hideOnAdmin = Boolean(pathname?.startsWith('/admin'))

  const [open, setOpen] = useState(false)
  const [forcedSource, setForcedSource] = useState<ChatSource | null>(null)
  const chatSource = forcedSource ?? pathSource
  const isRecruit = chatSource !== 'guest'

  const [bootstrapping, setBootstrapping] = useState(false)
  const [sending, setSending] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [authed, setAuthed] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const openRef = useRef(open)
  const tokenRef = useRef<string | null>(null)
  const phoneRef = useRef('')
  const sourceRef = useRef(chatSource)
  openRef.current = open
  tokenRef.current = token
  phoneRef.current = phone
  sourceRef.current = chatSource

  const applyPayload = useCallback((data: ChatPayload, phoneForStore?: string | null) => {
    if (data.access_token) {
      setToken(data.access_token)
      const p = phoneForStore || data.phone || ''
      writeStored(sourceRef.current, data.access_token, p)
      if (p) setPhone(digitsOnly(p))
    }
    if (Array.isArray(data.messages)) {
      setMessages(data.messages)
    }
    setAuthed(true)
  }, [])

  const fetchSession = useCallback(
    async (t: string, phoneValue: string) => {
      const digits = digitsOnly(phoneValue)
      const q = digits.length >= 10 ? `?phone=${encodeURIComponent(digits)}` : ''
      const res = await fetch(`/api/idol/chat/${encodeURIComponent(t)}${q}`, { cache: 'no-store' })
      if (res.status === 404) {
        clearStored(sourceRef.current)
        setToken(null)
        setMessages([])
        setAuthed(false)
        return
      }
      if (!res.ok) throw new Error('load_failed')
      const data = (await res.json()) as ChatPayload
      applyPayload(data, digits || data.phone)
    },
    [applyPayload],
  )

  const startSession = useCallback(
    async (opts?: { anonymous?: boolean }) => {
      const phoneDigits = opts?.anonymous ? '' : digitsOnly(phone)
      if (!opts?.anonymous && phoneDigits !== '' && phoneDigits.length < 10) {
        setError('電話番号は10桁以上で入力してください')
        return
      }
      setBootstrapping(true)
      setError(null)
      try {
        const res = await fetch('/api/idol/chat/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            store_code: storeCode,
            source: chatSource,
            ...(phoneDigits ? { phone: phoneDigits } : {}),
            name: name.trim() || undefined,
          }),
        })
        if (!res.ok) throw new Error('start_failed')
        const data = (await res.json()) as ChatPayload
        applyPayload(data, phoneDigits || null)
      } catch {
        setError('接続に失敗しました。しばらくしてからお試しください。')
      } finally {
        setBootstrapping(false)
      }
    },
    [applyPayload, chatSource, name, phone, storeCode],
  )

  const resumeSession = useCallback(async () => {
    const phoneDigits = digitsOnly(phone)
    if (phoneDigits.length < 10) {
      setError('続きから開くには電話番号が必要です')
      return
    }
    setBootstrapping(true)
    setError(null)
    try {
      const res = await fetch('/api/idol/chat/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneDigits, source: chatSource }),
      })
      if (res.status === 404) {
        setError('この電話番号の会話は見つかりません。新規開始してください。')
        return
      }
      if (!res.ok) throw new Error('resume_failed')
      const data = (await res.json()) as ChatPayload
      applyPayload(data, phoneDigits)
    } catch {
      setError('接続に失敗しました。しばらくしてからお試しください。')
    } finally {
      setBootstrapping(false)
    }
  }, [applyPayload, chatSource, phone])

  useEffect(() => {
    if (!open) return
    const stored = readStored(chatSource)
    if (stored.phone && !phone) {
      setPhone(stored.phone)
    }
    if (stored.token && !stored.phone && !authed) {
      setToken(stored.token)
      void fetchSession(stored.token, '').catch(() => clearStored(chatSource))
    }
  }, [open, chatSource]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<{ source?: ChatSource }>).detail
      if (detail?.source === 'guest' || detail?.source === 'recruit' || detail?.source === 'staff_recruit') {
        setForcedSource(detail.source)
      }
      setOpen(true)
    }
    window.addEventListener('idol-open-chat', onOpen)
    return () => window.removeEventListener('idol-open-chat', onOpen)
  }, [])

  useEffect(() => {
    if (!open || !authed || !token) return

    void fetchSession(token, phone).catch(() => {})

    const pollId = window.setInterval(() => {
      if (!openRef.current || !tokenRef.current) return
      void fetchSession(tokenRef.current, phoneRef.current).catch(() => {})
    }, POLL_MS)

    const beat = () => {
      if (!openRef.current || !tokenRef.current) return
      const digits = digitsOnly(phoneRef.current)
      void fetch(`/api/idol/chat/${encodeURIComponent(tokenRef.current)}/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(digits.length >= 10 ? { phone: digits } : {}),
        keepalive: true,
      }).catch(() => {})
    }
    beat()
    const hbId = window.setInterval(beat, HEARTBEAT_MS)

    return () => {
      window.clearInterval(pollId)
      window.clearInterval(hbId)
    }
  }, [open, authed, token, phone, fetchSession])

  useEffect(() => {
    if (!open) return
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, open])

  const closeWidget = () => {
    if (tokenRef.current) {
      try {
        const digits = digitsOnly(phoneRef.current)
        const body = JSON.stringify(digits.length >= 10 ? { phone: digits } : {})
        navigator.sendBeacon?.(
          `/api/idol/chat/${encodeURIComponent(tokenRef.current)}/heartbeat`,
          new Blob([body], { type: 'application/json' }),
        )
      } catch {
        /* ignore */
      }
    }
    setOpen(false)
    setForcedSource(null)
    setAuthed(false)
    setMessages([])
    setDraft('')
    setError(null)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text || !token || sending) return
    const phoneDigits = digitsOnly(phone)
    setSending(true)
    setError(null)
    try {
      const res = await fetch(`/api/idol/chat/${encodeURIComponent(token)}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          ...(phoneDigits.length >= 10 ? { phone: phoneDigits } : {}),
        }),
      })
      if (!res.ok) throw new Error('send_failed')
      const data = (await res.json()) as ChatPayload
      applyPayload(data, phoneDigits || data.phone)
      setDraft('')
    } catch {
      setError('送信に失敗しました。')
    } finally {
      setSending(false)
    }
  }

  if (hideOnAdmin || !open) return null

  const phoneDigits = digitsOnly(phone)
  const title =
    chatSource === 'staff_recruit'
      ? 'アイドル学園 内勤求人'
      : isRecruit
        ? 'アイドル学園 求人受付'
        : 'スタッフとチャット'

  return (
    <div className="fixed inset-0 z-[10050] flex items-end sm:items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="閉じる"
        onClick={closeWidget}
      />
      <div
        className="relative w-full sm:max-w-md sm:mx-4 bg-[#fffaf8] text-[#1c1917] rounded-t-2xl sm:rounded-2xl border border-[#e7d5d8] shadow-2xl flex flex-col overflow-hidden"
        style={{ height: 'min(72vh, 560px)' }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e7d5d8] bg-white">
          <div>
            <p className="text-sm font-semibold tracking-wider" style={{ color: ACCENT }}>
              {title}
            </p>
            <p className="text-[10px] text-[#78716c] mt-0.5 tracking-wider">
              {isRecruit
                ? 'ご応募・ご質問を気軽にどうぞ。匿名でもOKです'
                : '電話が難しいときはこちらから。続きは電話番号で再開できます'}
            </p>
          </div>
          <button
            type="button"
            onClick={closeWidget}
            className="text-[#a8a29e] hover:text-[#1c1917] text-2xl leading-none px-1"
          >
            &times;
          </button>
        </div>

        {!authed ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void startSession()
            }}
            className="flex-1 p-4 flex flex-col gap-3"
          >
            <p className="text-xs text-[#57534e] leading-relaxed">
              電話番号は任意です。入れると同じ番号で会話を再開できます。
            </p>
            <div>
              <label className="block text-[12px] text-[#78716c] mb-1">
                電話番号<span className="text-[#a8a29e] ml-1">任意</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={32}
                placeholder="090-1234-5678"
                className="w-full rounded-lg bg-white border border-[#e7d5d8] px-3 py-2.5 text-sm outline-none focus:border-[#9f1239] focus:ring-1 focus:ring-[#9f1239]/20"
              />
            </div>
            <div>
              <label className="block text-[12px] text-[#78716c] mb-1">お名前（任意）</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                placeholder="例：タナカ"
                className="w-full rounded-lg bg-white border border-[#e7d5d8] px-3 py-2.5 text-sm outline-none focus:border-[#9f1239] focus:ring-1 focus:ring-[#9f1239]/20"
              />
            </div>
            {error && <p className="text-xs text-rose-600">{error}</p>}
            <button
              type="submit"
              disabled={bootstrapping || (phoneDigits !== '' && phoneDigits.length < 10)}
              className="mt-auto w-full py-3 rounded-xl text-sm font-medium tracking-wider disabled:opacity-40 text-white"
              style={{ background: ACCENT }}
            >
              {bootstrapping ? '接続中…' : 'チャットを開始'}
            </button>
            <button
              type="button"
              disabled={bootstrapping}
              onClick={() => void startSession({ anonymous: true })}
              className="w-full py-2 text-[11px] text-[#a8a29e] hover:text-[#78716c]"
            >
              匿名で気軽に開始する
            </button>
            <button
              type="button"
              disabled={bootstrapping || phoneDigits.length < 10}
              onClick={() => void resumeSession()}
              className="w-full py-2.5 rounded-xl border border-[#e7d5d8] bg-white text-[#57534e] text-xs hover:border-[#9f1239] disabled:opacity-40"
            >
              続きから開く（電話番号で再開）
            </button>
          </form>
        ) : (
          <>
            <div className="px-3 py-1.5 bg-white border-b border-[#e7d5d8] text-[10px] text-[#78716c]">
              {phoneDigits.length >= 10 ? `電話 ${phoneDigits}` : '匿名チャット'}
            </div>
            <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 bg-[#faf5f6]">
              {bootstrapping && messages.length === 0 && (
                <p className="text-center text-xs text-[#a8a29e] py-8">読み込み中…</p>
              )}
              {messages.map((m) => {
                const mine = m.sender_type === 'customer'
                const bot = m.sender_type === 'bot'
                const readLabel = mine && m.is_read ? formatReadAt(m.read_at) : null
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[85%]">
                      <div
                        className={`rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
                          mine
                            ? 'text-white'
                            : bot
                              ? 'bg-white border border-[#e7d5d8] text-[#57534e]'
                              : 'bg-white border border-[#e7d5d8] text-[#1c1917] shadow-sm'
                        }`}
                        style={mine ? { background: ACCENT } : undefined}
                      >
                        {m.message}
                      </div>
                      {readLabel && (
                        <p className="text-[10px] text-[#a8a29e] mt-0.5 text-right">既読 {readLabel}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            {error && <p className="px-4 text-xs text-rose-600 pb-1">{error}</p>}
            <form onSubmit={handleSend} className="p-3 border-t border-[#e7d5d8] bg-white flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={2000}
                placeholder="メッセージを入力…"
                className="flex-1 rounded-xl bg-[#fffaf8] border border-[#e7d5d8] px-3 py-2.5 text-sm outline-none focus:border-[#9f1239]"
              />
              <button
                type="submit"
                disabled={sending || !draft.trim() || !token}
                className="rounded-xl text-white px-4 py-2 text-sm font-medium disabled:opacity-40"
                style={{ background: ACCENT }}
              >
                送信
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
