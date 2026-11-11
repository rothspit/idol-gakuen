'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter, useParams } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function EditGirlPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)

  // フォームの入力値
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    content: '', // 店長コメント
    message: '', // 本人メッセージ
    image_url: '',
    aws_email_address: '' // AWS用アドレス(表示のみ)
  })

  // 画像アップロード用の状態
  const [uploading, setUploading] = useState(false)

  // 初期データ読み込み
  useEffect(() => {
    const fetchGirl = async () => {
      const { data, error } = await supabase
        .from('girls')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) {
        alert('読み込みエラー')
        return
      }
      if (data) {
        setFormData({
          name: data.name || '',
          email: data.email || '',
          content: data.content || '',
          message: data.message || '', // 既存の message 列
          image_url: data.image_url || '',
          aws_email_address: data.aws_email_address || ''
        })
      }
    }
    fetchGirl()
  }, [params.id])

  // 入力変更ハンドラ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // 画像アップロード処理
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('画像を選択してください')
      }

      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `girls-profiles/${fileName}` // girls-profilesフォルダに入れる

      // Supabaseストレージにアップロード
      const { error: uploadError } = await supabase.storage
        .from('diary-images') // ※バケット名は既存のものを使用
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // 公開URLを取得
      const { data } = supabase.storage
        .from('diary-images')
        .getPublicUrl(filePath)

      // フォームの状態を更新
      setFormData({ ...formData, image_url: data.publicUrl })
      alert('画像アップロード成功！')

    } catch (error: any) {
      alert('アップロード失敗: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  // 保存処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('girls')
      .update({
        name: formData.name,
        email: formData.email,
        content: formData.content,
        message: formData.message, // メッセージも保存
        image_url: formData.image_url, // 画像URLも保存
      })
      .eq('id', params.id)

    setLoading(false)

    if (error) {
      alert('エラー: ' + error.message)
    } else {
      alert('保存しました！')
      router.push('/admin') // 一覧に戻る
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-slate-800">女の子編集: {formData.name}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 名前 */}
          <div>
            <label className="block text-sm font-bold mb-2 text-slate-700">名前</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg text-slate-900"
              required
            />
          </div>

          {/* プロフィール画像 */}
          <div className="border p-4 rounded-lg bg-gray-50">
            <label className="block text-sm font-bold mb-2 text-slate-700">プロフィール画像</label>

            {/* プレビュー表示 */}
            {formData.image_url && (
              <div className="mb-4">
                <img
                  src={formData.image_url}
                  alt="プレビュー"
                  className="w-32 h-40 object-cover rounded-lg shadow-sm border bg-white"
                />
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="w-full text-slate-900"
            />
            {uploading && <p className="text-sm text-blue-500 mt-2">アップロード中...</p>}
          </div>

          {/* 店長コメント */}
          <div>
            <label className="block text-sm font-bold mb-2 text-blue-600">店長のおすすめコメント</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg h-24 text-slate-900"
              placeholder="店長から見たおすすめポイント..."
            />
          </div>

          {/* 本人メッセージ */}
          <div>
            <label className="block text-sm font-bold mb-2 text-pink-500">本人からのメッセージ (message)</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg h-24 bg-pink-50 focus:bg-white transition text-slate-900"
              placeholder="はじめまして！〇〇です。よろしくね❤️"
            />
          </div>

          {/* 管理用情報（編集不可） */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">ログイン用Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border p-2 rounded bg-gray-100 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">AWS日記用アドレス</label>
              <input
                type="text"
                value={formData.aws_email_address || '未発行'}
                disabled
                className="w-full border p-2 rounded bg-gray-100 text-gray-500 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '保存中...' : '保存する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
