'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

type ChatMessage = {
  id?: string
  content: string
  sender: string
  created_at: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadMessages = useCallback(async () => {
    const res = await fetch('/api/chat/messages', { credentials: 'include' })
    if (!res.ok) {
      setError('メッセージの取得に失敗しました')
      return
    }
    const json = await res.json()
    setMessages(json.messages ?? [])
  }, [])

  useEffect(() => {
    async function init() {
      await fetch('/api/chat/session', { method: 'POST', credentials: 'include' })
      await loadMessages()
      setReady(true)
    }
    init()
    const timer = setInterval(loadMessages, 4000)
    return () => clearInterval(timer)
  }, [loadMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !ready) return

    const messageToSend = inputText.trim()
    setInputText('')
    setMessages((prev) => [
      ...prev,
      { content: messageToSend, sender: 'user', created_at: new Date().toISOString() },
    ])

    const res = await fetch('/api/chat/messages', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: messageToSend }),
    })

    if (!res.ok) {
      setError('送信に失敗しました。もう一度お試しください。')
      await loadMessages()
      return
    }

    try {
      await fetch('/api/notify', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSend }),
      })
    } catch {
      /* 通知失敗は送信自体は成功扱い */
    }

    await loadMessages()
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-100">
      <div className="bg-slate-900 text-white p-3 flex justify-between items-center shadow-md z-10">
        <div className="font-bold flex items-center gap-2">
          <Link href="/funabashi" className="text-xl">
            ⬅
          </Link>
          <span className="text-sm md:text-base">チャット受付</span>
        </div>

        <a
          href="tel:05017459665"
          className="bg-pink-600 text-xs px-4 py-2 rounded-full font-bold animate-pulse shadow-lg hover:bg-pink-500"
        >
          📞 電話する
        </a>
      </div>

      <div className="bg-yellow-50 p-2 text-[10px] text-center text-slate-600 border-b border-yellow-100">
        ※このチャットはあなた専用のセッションです。他のお客様の内容は表示されません。
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-xs text-center py-2 px-3">{error}</div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
        <div className="flex justify-start">
          <div className="bg-white text-slate-800 p-3 rounded-2xl rounded-tl-none shadow max-w-[85%] text-sm">
            いらっしゃいませ！😊
            <br />
            こちらは匿名チャットです。
            <br />
            「今から入れますか？」など、お気軽にお問い合わせください！
          </div>
        </div>

        {messages.map((msg, index) => (
          <div
            key={msg.id ?? index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`p-3 rounded-2xl shadow max-w-[85%] text-sm whitespace-pre-wrap leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-green-500 text-white rounded-tr-none'
                  : 'bg-white text-slate-800 rounded-tl-none'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="bg-slate-200 p-3 border-t border-slate-300 flex gap-2 fixed bottom-0 w-full pb-safe"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="メッセージを入力..."
          disabled={!ready}
          className="flex-1 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-full px-4 py-3 shadow-inner focus:outline-none focus:border-green-500 text-base font-bold disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!ready}
          className="bg-green-600 text-white font-bold px-5 py-2 rounded-full shadow-lg hover:bg-green-500 active:scale-95 transition-transform disabled:opacity-50"
        >
          送信
        </button>
      </form>
    </div>
  )
}
