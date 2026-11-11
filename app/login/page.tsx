'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

// Supabaseクライアントの作成
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false) // 登録モードかログインモードか

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (isSignUp) {
      // 新規登録
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) {
        alert('エラー: ' + error.message)
      } else {
        alert('🎉 登録完了！ログインしました。')
        router.push('/') // トップへ戻る
        router.refresh()
      }
    } else {
      // ログイン
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        alert('ログイン失敗: メールかパスワードが間違っています。')
      } else {
        router.push('/') // トップへ戻る
        router.refresh()
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-black text-center mb-6 text-slate-800">
          {isSignUp ? '✨ 無料会員登録' : '🔑 ログイン'}
        </h1>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">メールアドレス</label>
            <input
              type="email"
              required
              className="w-full p-3 border rounded-lg bg-slate-50"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">パスワード</label>
            <input
              type="password"
              required
              className="w-full p-3 border rounded-lg bg-slate-50"
              placeholder="6文字以上"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 text-white font-bold py-3 rounded-lg hover:bg-pink-500 transition-all shadow-md active:scale-95"
          >
            {loading ? '処理中...' : (isSignUp ? '無料で登録してログイン' : 'ログインする')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-slate-500 underline hover:text-pink-600"
          >
            {isSignUp ? 'すでにアカウントをお持ちの方はログイン' : '初めての方はこちら（無料登録）'}
          </button>
        </div>
      </div>
    </div>
  )
}
