'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 🔥 カテゴリーごとにタグを管理
const TAG_CATEGORIES = [
  {
    title: '💃 体型',
    tags: [
      'スレンダー', '普通', 'ちょいムチ', 'グラマー', 'ぽっちゃり', '小柄', '長身'
    ]
  },
  {
    title: '✨ ルックス',
    tags: [
      '素人系', '女子大生系', '清楚系', 'ロリ系', 'OL系',
      'ギャル系', 'モデル系', '可愛い系', 'お姉さん系', '萌え系',
      '黒髪', '色白系', '綺麗系', '美少女系', '乳輪大きい',
      '喫煙しない', 'レズビアン', '高学歴'
    ]
  },
  {
    title: '✨ 個性',
    tags: [
      '経験浅め', '完全未経験', 'AV女優', '巨乳', '爆乳', '微乳',
      '美脚', '美尻', '非喫煙', 'パイパン', 'ハーフ',
      'アニメ声', 'ニューハーフ', '乳首ピンク', 'テクニシャン'
    ]
  },
  {
    title: '🏩 基本プレイリスト',
    tags: [
      'Dキス', '全身リップ', '素股', '指入れ', '手コキ',
      'フェラ', 'パイズリ', '足コキ', '球舐め', '顔面発射（化粧直し時間必須）',
      '顔面発射（ラストのみ）', '口内発射', '69',
      'クンニ', '乳首舐め', 'セクハラ', '痴漢'
    ]
  },
  {
    title: '⚡️ オプション',
    tags: [
      'バイブ', 'ローター', '電マ', '遠隔ローター', 'ノーパン訪問', 'ノーブラ訪問',
      '即尺', '聖水', 'イラマチオ', '睾丸マッサージ', '回春マッサージ', '男の潮吹き',
      '赤ちゃん幼児プレイ', '母乳・授乳', 'オナニー鑑賞', '前立腺マッサージ',
      'パンスト破り', 'パンティ持ち帰り', 'ごっくん', 'コスプレ', 'AF',
      '3P（男2）', '3P（女2）', '即プレイ', '動画顔出し', '動画顔なし',
      '潮吹き', '顔面騎乗', '隠語・言葉責め', '剃毛', '浣腸',
      '濃厚サービス', 'アイマスク', 'ローションプレイ', 'アロママッサージ'
    ]
  },
  {
    title: '🚗 移動・場所',
    tags: [
      'ホテル出張', '自宅出張', '待ち合わせ', '車内待機', '遠征OK'
    ]
  }
]

const BRAND_OPTIONS = [
  { slug: 'idol-gakuen', label: '🏫 アイドル学園' },
]

export default function AdminPage() {
  const [mode, setMode] = useState<'daily' | 'ranking' | 'chat' | 'diary' | 'diary_settings'>('daily')
  const [girls, setGirls] = useState<any[]>([])

  // ブランド切り替え用
  const [currentBrandSlug, setCurrentBrandSlug] = useState('idol-gakuen')
  const [currentBrandId, setCurrentBrandId] = useState<string | null>(null)

  // チャット用
  const [sessions, setSessions] = useState<any[]>([])
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [replyText, setReplyText] = useState('')

  // キャスト編集用
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGirl, setEditingGirl] = useState<any>(null)

  const [formData, setFormData] = useState({
    name: '', age: '', height: '', bust: '', waist: '', hip: '', cup: '',
    schedule_comment: '',
    today_hours: '',
    message: '',
    q_hobby: '', q_type: '', q_fetish: '',
    q_sensitive: '', q_play: '', q_first_time: '', q_off_day: '', q_dream: '',
    birthplace: '', zodiac: '', blood_type: '', alcohol: '', tobacco: '',
    charm_point: '', similar_celeb: '', prev_job: '',
    tags: [] as string[]
  })

  const [uploading, setUploading] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])

  // 時間入力支援
  const [timeStart, setTimeStart] = useState('')
  const [timeEnd, setTimeEnd] = useState('')

  // 日記用
  const [diaries, setDiaries] = useState<any[]>([])
  const [diaryForm, setDiaryForm] = useState({ girl_id: '', title: '', content: '' })
  const [diaryImage, setDiaryImage] = useState<File | null>(null)
  const [diaryVideo, setDiaryVideo] = useState<File | null>(null)

  // スケジュールページ有効/無効
  const [scheduleActive, setScheduleActive] = useState<boolean | null>(null)

  useEffect(() => {
    fetchChatSessions()
    fetchDiaries()
    fetchScheduleSetting()
    const interval = setInterval(() => { fetchChatSessions() }, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchScheduleSetting = async () => {
    const { data } = await supabase.from('site_settings').select('value').eq('key', 'schedule_page').single()
    setScheduleActive(data?.value?.active ?? false)
  }

  const toggleSchedulePage = async (newActive: boolean) => {
    setScheduleActive(newActive)
    await supabase.from('site_settings').upsert({ key: 'schedule_page', value: { active: newActive }, updated_at: new Date().toISOString() })
  }

  // ブランドID解決
  useEffect(() => {
    const resolve = async () => {
      const { data } = await supabase.from('brands').select('id').eq('slug', currentBrandSlug).single()
      if (data) setCurrentBrandId(data.id)
    }
    resolve()
  }, [currentBrandSlug])

  // ブランド変更時にキャスト・日記を再取得
  useEffect(() => {
    if (currentBrandId) {
      fetchGirls()
      fetchDiaries()
    }
  }, [currentBrandId])

  // --- 時間生成ヘルパー（翌朝まで対応） ---
  const timeOptions = []
  for (let i = 10; i < 34; i++) {
    const h = i % 24
    const hStr = h < 10 ? `0${h}` : `${h}`
    timeOptions.push(`${hStr}:00`)
    timeOptions.push(`${hStr}:30`)
  }

  useEffect(() => {
    if (timeStart && timeEnd) {
      setFormData(prev => ({ ...prev, today_hours: `${timeStart}〜${timeEnd}` }))
    } else if (timeStart) {
      setFormData(prev => ({ ...prev, today_hours: `${timeStart}〜` }))
    }
  }, [timeStart, timeEnd])

  // --- データ取得 ---
  const fetchGirls = async () => {
    let query = supabase.from('girls').select('*').order('ranking_order', { ascending: true })
    if (currentBrandId) query = query.eq('brand_id', currentBrandId)
    const { data } = await query
    if (data) setGirls(data)
  }

  const fetchDiaries = async () => {
    let query = supabase.from('diaries').select('*, girls(name, images)').order('created_at', { ascending: false })
    if (currentBrandId) query = query.eq('brand_id', currentBrandId)
    const { data } = await query
    if (data) setDiaries(data)
  }

  const fetchChatSessions = async () => {
    const res = await fetch('/api/admin/chat/sessions', { credentials: 'include' })
    if (!res.ok) return
    const json = await res.json()
    setSessions(json.sessions ?? [])
  }

  // --- 機能 ---
  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('このチャット履歴を削除しますか？')) return
    await fetch(`/api/admin/chat/sessions/${encodeURIComponent(sessionId)}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (selectedSession === sessionId) { setSelectedSession(null); setChatMessages([]) }
    fetchChatSessions()
  }

  const openChat = async (sessionId: string) => {
    setSelectedSession(sessionId)
    const res = await fetch(
      `/api/admin/chat/messages?session_id=${encodeURIComponent(sessionId)}`,
      { credentials: 'include' }
    )
    if (!res.ok) return
    const json = await res.json()
    setChatMessages(json.messages ?? [])
  }

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault(); if (!replyText.trim() || !selectedSession) return
    const content = replyText
    setChatMessages([...chatMessages, { session_id: selectedSession, content, sender: 'admin', created_at: new Date().toISOString() }])
    setReplyText('')
    await fetch('/api/admin/chat/messages', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: selectedSession, content }),
    })
    fetchChatSessions()
    openChat(selectedSession)
  }

  const handlePostDiary = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!diaryForm.girl_id) return alert('キャストを選択')
    setUploading(true)
    try {
      // 画像アップロード
      let imageUrls: string[] = []
      if (diaryImage) {
        const fileName = `${diaryForm.girl_id}/diary_${Date.now()}.${diaryImage.name.split('.').pop()}`
        const { error: upErr } = await supabase.storage.from('diary-images').upload(fileName, diaryImage)
        if (upErr) throw upErr
        const { data: { publicUrl } } = supabase.storage.from('diary-images').getPublicUrl(fileName)
        imageUrls = [publicUrl]
      }

      // 動画アップロード
      let videoUrls: string[] = []
      if (diaryVideo) {
        const videoName = `${diaryForm.girl_id}/${Date.now()}-video.${diaryVideo.name.split('.').pop()}`
        const { error: videoErr } = await supabase.storage.from('diary-images').upload(videoName, diaryVideo)
        if (videoErr) throw videoErr
        const { data: { publicUrl } } = supabase.storage.from('diary-images').getPublicUrl(videoName)
        videoUrls = [publicUrl]
      }

      // データベースに保存
      await supabase.from('diaries').insert([{
        girl_id: parseInt(diaryForm.girl_id),
        title: diaryForm.title,
        content: diaryForm.content,
        images: imageUrls,
        videos: videoUrls,
        brand_id: currentBrandId
      }])

      alert('投稿完了')
      setDiaryForm({ girl_id: '', title: '', content: '' })
      setDiaryImage(null)
      setDiaryVideo(null)
      fetchDiaries()
    } catch (err: any) { alert(err.message) } finally { setUploading(false) }
  }

  const handleDeleteDiary = async (id: number) => { if (confirm('削除しますか？')) { await supabase.from('diaries').delete().eq('id', id); fetchDiaries() } }
  const toggleAttendance = async (id: number, currentStatus: boolean) => { const newStatus = !currentStatus; setGirls(girls.map(g => g.id === id ? { ...g, is_attending: newStatus } : g)); await supabase.from('girls').update({ is_attending: newStatus }).eq('id', id) }
  const handleDelete = async (id: number) => { if (confirm('削除しますか？')) { await supabase.from('girls').delete().eq('id', id); fetchGirls() } }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const newFiles = Array.from(files)
      setImageFiles(prev => [...prev, ...newFiles])
      setImagePreviews(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))])
    }
    e.target.value = ''
  }

  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  // タグのON/OFF切り替え処理
  const toggleTag = (tag: string) => {
    setFormData(prev => {
      const currentTags = prev.tags || []
      if (currentTags.includes(tag)) {
        return { ...prev, tags: currentTags.filter(t => t !== tag) }
      } else {
        return { ...prev, tags: [...currentTags, tag] }
      }
    })
  }

  const openModal = (girl: any = null) => {
    setTimeStart(''); setTimeEnd('')

    if (girl) {
      setEditingGirl(girl);
      setFormData({
        name: girl.name,
        age: girl.age || '',
        height: girl.height || '',
        bust: girl.bust || '',
        waist: girl.waist || '',
        hip: girl.hip || '',
        cup: girl.cup || '',
        schedule_comment: girl.schedule_comment || '',
        today_hours: girl.today_hours || '',
        message: girl.message || '',
        q_hobby: girl.q_hobby || '',
        q_type: girl.q_type || '',
        q_fetish: girl.q_fetish || '',
        q_sensitive: girl.q_sensitive || '',
        q_play: girl.q_play || '',
        q_first_time: girl.q_first_time || '',
        q_off_day: girl.q_off_day || '',
        q_dream: girl.q_dream || '',
        birthplace: girl.birthplace || '',
        zodiac: girl.zodiac || '',
        blood_type: girl.blood_type || '',
        alcohol: girl.alcohol || '',
        tobacco: girl.tobacco || '',
        charm_point: girl.charm_point || '',
        similar_celeb: girl.similar_celeb || '',
        prev_job: girl.prev_job || '',
        tags: girl.tags || []
      })
      setExistingImages(girl.images || [])
    } else {
      setEditingGirl(null);
      setFormData({
        name: '', age: '', height: '', bust: '', waist: '', hip: '', cup: '',
        schedule_comment: '', today_hours: '', message: '',
        q_hobby: '', q_type: '', q_fetish: '',
        q_sensitive: '', q_play: '', q_first_time: '', q_off_day: '', q_dream: '',
        birthplace: '', zodiac: '', blood_type: '', alcohol: '', tobacco: '',
        charm_point: '', similar_celeb: '', prev_job: '',
        tags: []
      })
      setExistingImages([])
    }
    setImageFiles([]); setImagePreviews([]); setIsModalOpen(true)
  }

  const toNum = (val: string) => (val === '' || val === null || val === undefined) ? null : parseInt(val)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setUploading(true)
    try {
      // 既存画像（削除されなかったもの）を保持
      const imageUrls = [...existingImages]

      // 新しい画像をアップロード
      for (const file of imageFiles) {
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${file.name.split('.').pop()}`
        const { error: upErr } = await supabase.storage.from('cast-photos').upload(fileName, file)
        if (upErr) throw upErr
        const { data: { publicUrl } } = supabase.storage.from('cast-photos').getPublicUrl(fileName)
        imageUrls.push(publicUrl)
      }

      const saveData = {
        name: formData.name,
        age: toNum(formData.age),
        height: toNum(formData.height),
        bust: toNum(formData.bust),
        waist: toNum(formData.waist),
        hip: toNum(formData.hip),
        cup: formData.cup,
        schedule_comment: formData.schedule_comment,
        today_hours: formData.today_hours,
        message: formData.message,
        q_hobby: formData.q_hobby,
        q_type: formData.q_type,
        q_fetish: formData.q_fetish,
        q_sensitive: formData.q_sensitive,
        q_play: formData.q_play,
        q_first_time: formData.q_first_time,
        q_off_day: formData.q_off_day,
        q_dream: formData.q_dream,
        birthplace: formData.birthplace,
        zodiac: formData.zodiac,
        blood_type: formData.blood_type,
        alcohol: formData.alcohol,
        tobacco: formData.tobacco,
        charm_point: formData.charm_point,
        similar_celeb: formData.similar_celeb,
        prev_job: formData.prev_job,
        tags: formData.tags,
        images: imageUrls
      }

      if (editingGirl) await supabase.from('girls').update(saveData).eq('id', editingGirl.id)
      else await supabase.from('girls').insert([{ ...saveData, brand_id: currentBrandId }])

      alert('保存しました'); setIsModalOpen(false); fetchGirls()
    } catch (err: any) { alert(err.message) } finally { setUploading(false) }
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-20 text-slate-900">
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-10 shadow-md flex justify-between items-center">
        <h1 className="font-bold text-lg">🛠 店長専用 コックピット</h1>
        <a href="/funabashi" target="_blank" className="text-xs bg-pink-600 px-3 py-1 rounded hover:bg-pink-500">サイトを確認 ➡</a>
      </header>

      <div className="max-w-6xl mx-auto p-2 md:p-4">
        {/* スケジュールページ ON/OFF */}
        <div className="bg-white rounded-xl shadow mb-3 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-700">📅 スケジュールページ</span>
            {scheduleActive === null ? (
              <span className="text-xs text-slate-400">読込中...</span>
            ) : scheduleActive ? (
              <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">アクティブ</span>
            ) : (
              <span className="text-xs font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">停止中</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => toggleSchedulePage(true)}
              disabled={scheduleActive === true}
              className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors ${
                scheduleActive === true
                  ? 'bg-green-500 text-white cursor-default'
                  : 'bg-slate-100 text-slate-600 hover:bg-green-100 border border-slate-200'
              }`}
            >
              アクティブ
            </button>
            <button
              onClick={() => toggleSchedulePage(false)}
              disabled={scheduleActive === false}
              className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors ${
                scheduleActive === false
                  ? 'bg-red-500 text-white cursor-default'
                  : 'bg-slate-100 text-slate-600 hover:bg-red-100 border border-slate-200'
              }`}
            >
              停止
            </button>
          </div>
        </div>

        {/* ブランド切り替え */}
        <div className="flex bg-white rounded-xl shadow mb-3 overflow-hidden">
          {BRAND_OPTIONS.map((b) => (
            <button
              key={b.slug}
              onClick={() => setCurrentBrandSlug(b.slug)}
              className={`flex-1 py-3 font-bold text-sm transition-colors ${
                currentBrandSlug === b.slug
                  ? b.slug === 'idol-gakuen'
                    ? 'bg-pink-600 text-white'
                    : 'bg-gradient-to-r from-purple-800 to-amber-600 text-white'
                  : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* タブ */}
        <div className="flex bg-white rounded-xl shadow mb-6 overflow-hidden flex-wrap">
          <button onClick={() => setMode('daily')} className={`flex-1 py-3 font-bold px-2 text-xs md:text-base ${mode === 'daily' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>📅 管理</button>
          <button onClick={() => setMode('chat')} className={`flex-1 py-3 font-bold px-2 text-xs md:text-base ${mode === 'chat' ? 'bg-green-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>💬 チャット</button>
          <button onClick={() => setMode('diary')} className={`flex-1 py-3 font-bold px-2 text-xs md:text-base ${mode === 'diary' ? 'bg-pink-500 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>📷 日記投稿</button>
          <button onClick={() => setMode('diary_settings')} className={`flex-1 py-3 font-bold px-2 text-xs md:text-base ${mode === 'diary_settings' ? 'bg-purple-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>📩 メアド発行</button>
        </div>

        {/* 1. キャスト管理 */}
        {mode === 'daily' && (
          <div>
            <div className="flex justify-between items-center mb-4"><h2 className="font-bold text-slate-700">キャスト一覧 ({girls.length}名)</h2><button onClick={() => openModal()} className="bg-pink-600 text-white font-bold px-4 py-2 rounded-full shadow hover:bg-pink-500 flex items-center gap-1">＋ 新規入店</button></div>
            <div className="space-y-3">
              {girls.map((girl) => (
                <div key={girl.id} className={`bg-white p-4 rounded-xl shadow border-l-4 ${girl.is_attending ? 'border-green-500 bg-green-50/30' : 'border-slate-300'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 bg-slate-200 rounded-lg overflow-hidden shrink-0">
                        {girl.images?.[0] ? <img src={girl.images[0]} className="w-full h-full object-cover" /> : <div className="p-2 text-[10px] text-slate-400">No Image</div>}
                      </div>
                      <div>
                        <div className="font-bold text-lg">{girl.name} <span className="text-sm font-normal text-slate-500">{girl.age}歳</span></div>
                        {/* タグ表示 */}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {girl.tags && girl.tags.map((t: string) => (
                            <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-1 rounded border border-slate-200">{t}</span>
                          ))}
                        </div>
                        <div className="text-sm text-slate-900 mt-1 font-bold">⏰ {girl.today_hours || '時間未定'}</div>
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => toggleAttendance(girl.id, girl.is_attending)} className={`text-xs px-3 py-1 rounded-full border font-bold ${girl.is_attending ? 'bg-green-500 text-white border-green-600' : 'bg-white text-slate-500'}`}>{girl.is_attending ? '🟢 出勤中' : '⚪️ お休み'}</button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => openModal(girl)} className="bg-slate-100 px-3 py-1 rounded text-sm font-bold border border-slate-300 text-slate-600">編集</button>
                      <button onClick={() => handleDelete(girl.id)} className="bg-red-50 px-3 py-1 rounded text-sm font-bold border border-red-100 text-red-400">削除</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. チャット */}
        {mode === 'chat' && (
          <div className="flex flex-col md:flex-row h-[70vh] bg-white rounded-xl shadow overflow-hidden">
            <div className="w-full md:w-1/3 border-r border-slate-200 overflow-y-auto bg-slate-50">
              {sessions.map((sess) => (
                <div key={sess.session_id} className={`p-4 border-b hover:bg-white relative group ${selectedSession === sess.session_id ? 'bg-white border-l-4 border-l-green-500' : ''}`}>
                  <div onClick={() => openChat(sess.session_id)} className="cursor-pointer">
                    <div className="flex justify-between items-center mb-1"><span className="font-bold text-sm text-slate-800">{sess.sender === 'user' ? '👤 客' : '店'}</span><span className="text-[10px] text-slate-500">{new Date(sess.created_at).toLocaleString()}</span></div>
                    <p className="text-xs text-slate-600 truncate w-[85%]">{sess.content}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteSession(sess.session_id) }} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 p-2" title="削除">🗑️</button>
                </div>
              ))}
            </div>
            <div className="flex-1 flex flex-col bg-white">
              {selectedSession ? (
                <>
                  <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-100">
                    {chatMessages.map((msg, i) => (<div key={i} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}><div className={`p-3 rounded-lg max-w-[80%] text-sm whitespace-pre-wrap shadow ${msg.sender === 'admin' ? 'bg-green-600 text-white' : 'bg-white text-slate-800'}`}>{msg.content}</div></div>))}
                  </div>
                  <form onSubmit={sendReply} className="p-3 border-t flex gap-2"><input className="flex-1 border border-slate-300 rounded p-2 text-slate-900" value={replyText} onChange={e => setReplyText(e.target.value)} /><button className="bg-green-600 text-white px-4 py-2 rounded">送信</button></form>
                </>
              ) : <div className="flex items-center justify-center h-full text-slate-400">選択してください</div>}
            </div>
          </div>
        )}

        {/* 3. 日記投稿 */}
        {mode === 'diary' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="font-bold text-lg mb-4 text-pink-600">✏️ 新しい日記を書く</h2>
              <form onSubmit={handlePostDiary} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">キャスト</label>
                  <select className="w-full border border-slate-300 rounded p-2 text-slate-900 bg-white" value={diaryForm.girl_id} onChange={e => setDiaryForm({ ...diaryForm, girl_id: e.target.value })} required>
                    <option value="">選択してください</option>
                    {girls.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-bold text-slate-500 block mb-1">タイトル</label><input type="text" className="w-full border border-slate-300 rounded p-2 text-slate-900" value={diaryForm.title} onChange={e => setDiaryForm({ ...diaryForm, title: e.target.value })} required /></div>
                <div><label className="text-xs font-bold text-slate-500 block mb-1">写真</label><input type="file" accept="image/*" className="w-full text-sm text-slate-900" onChange={e => setDiaryImage(e.target.files?.[0] || null)} /></div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">動画 🎥</label>
                  <input type="file" accept="video/*" className="w-full text-sm text-slate-900" onChange={e => setDiaryVideo(e.target.files?.[0] || null)} />
                  <p className="text-xs text-slate-400 mt-1">※10秒程度の短い動画推奨</p>
                </div>
                <div><label className="text-xs font-bold text-slate-500 block mb-1">本文</label><textarea className="w-full border border-slate-300 rounded p-2 h-32 text-slate-900" value={diaryForm.content} onChange={e => setDiaryForm({ ...diaryForm, content: e.target.value })}></textarea></div>
                <button type="submit" disabled={uploading} className="w-full bg-pink-600 text-white font-bold py-3 rounded-lg shadow">{uploading ? '投稿中...' : '日記を公開する'}</button>
              </form>
            </div>
            <div className="space-y-4">
              {diaries.map(diary => (
                <div key={diary.id} className="bg-white p-4 rounded-xl shadow flex gap-3">
                  <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0">{diary.images?.[0] && <img src={diary.images[0]} className="w-full h-full object-cover" />}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-sm text-slate-900">{diary.title}</h3>
                      <div className="flex gap-2">
                        <Link href={`/admin/diaries/${diary.id}/edit`} className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">編集</Link>
                        <button onClick={() => handleDeleteDiary(diary.id)} className="text-xs text-red-400">削除</button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">{diary.girls?.name}</p>
                    <p className="text-xs text-slate-700 mt-2 line-clamp-2">{diary.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. メアド管理 */}
        {mode === 'diary_settings' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-bold text-xl text-slate-800 mb-4 flex items-center gap-2">📩 写メ日記 投稿用アドレス管理</h2>
            <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg mb-6 text-sm text-slate-700"><p className="font-bold mb-1">⚡️ AWS公式ドメインで発行</p><p>「AWSアドレス発行」ボタンを押すと、お店の公式ドメインでアドレスを自動生成します。<br />（例: <code className="bg-indigo-100 px-1 rounded">g1@post.idolgakuen.jp</code>）</p></div>
            <div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead><tr className="bg-slate-100 text-slate-600 text-xs uppercase border-b border-slate-200"><th className="p-3">キャスト名</th><th className="p-3">専用投稿アドレス</th><th className="p-3">操作</th></tr></thead><tbody className="text-sm">{girls.map((girl) => (<tr key={girl.id} className="border-b border-slate-100 hover:bg-slate-50"><td className="p-3 font-bold text-slate-800 flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">{girl.images?.[0] && <img src={girl.images[0]} className="w-full h-full object-cover" />}</div>{girl.name}</td><td className="p-3 font-mono text-slate-600 select-all">{girl.post_email ? (<div className="flex items-center gap-2"><span className="bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200 block w-max max-w-[200px] truncate" title={girl.post_email}>{girl.post_email}</span><button onClick={() => { navigator.clipboard.writeText(girl.post_email); alert('コピーしました！') }} className="text-xs bg-slate-200 px-2 py-1 rounded hover:bg-slate-300">コピー</button></div>) : <span className="text-slate-400 text-xs">(未発行)</span>}</td><td className="p-3"><button onClick={async () => { if (!confirm(`「${girl.name}」のアドレスを、AWS公式ドメインに切り替えますか？`)) return; const myDomain = "post.idolgakuen.jp"; const newEmail = `g${girl.id}@${myDomain}`; await supabase.from('girls').update({ post_email: newEmail }).eq('id', girl.id); alert(`発行完了！AWS経由になります\n${newEmail}`); fetchGirls() }} className="text-xs bg-indigo-600 text-white font-bold px-4 py-2 rounded-full shadow hover:bg-indigo-500 active:scale-95 transition-transform flex items-center gap-1">AWSアドレス発行</button></td></tr>))}</tbody></table></div>
          </div>
        )}
      </div>

      {/* キャスト編集モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-4 font-bold flex justify-between items-center"><span>{editingGirl ? '編集' : '新規'}</span><button onClick={() => setIsModalOpen(false)}>&times;</button></div>
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">

              {/* 画像一覧（既存＋新規） */}
              <div className="mb-2">
                <label className="text-xs font-bold text-slate-500 block mb-2">写真（複数枚可）</label>
                <div className="flex flex-wrap gap-2">
                  {/* 既存画像 */}
                  {existingImages.map((url, i) => (
                    <div key={`existing-${i}`} className="relative group w-20 h-24 rounded-lg overflow-hidden border border-slate-200">
                      <img src={url} className="w-full h-full object-cover" alt={`写真${i + 1}`} />
                      {i === 0 && <span className="absolute top-0 left-0 bg-pink-600 text-white text-[8px] px-1">メイン</span>}
                      <button type="button" onClick={() => removeExistingImage(i)} className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                    </div>
                  ))}
                  {/* 新規追加プレビュー */}
                  {imagePreviews.map((url, i) => (
                    <div key={`new-${i}`} className="relative group w-20 h-24 rounded-lg overflow-hidden border-2 border-blue-300">
                      <img src={url} className="w-full h-full object-cover" alt={`新規${i + 1}`} />
                      <span className="absolute top-0 left-0 bg-blue-500 text-white text-[8px] px-1">NEW</span>
                      <button type="button" onClick={() => removeNewImage(i)} className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                    </div>
                  ))}
                  {/* 追加ボタン */}
                  <label className="cursor-pointer w-20 h-24 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center hover:border-blue-400 transition-colors">
                    <span className="text-xl text-slate-400">+</span>
                    <span className="text-[9px] text-slate-400">追加</span>
                    <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" multiple />
                  </label>
                </div>
              </div>

              {/* 基本情報 */}
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-slate-500">名前</label><input required className="w-full border border-slate-300 rounded p-2 text-slate-900 bg-white" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                <div><label className="text-xs font-bold text-slate-500">年齢</label><input type="number" className="w-full border border-slate-300 rounded p-2 text-slate-900 bg-white" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} /></div>
              </div>

              {/* 時間 */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <label className="text-xs font-bold text-slate-500 block mb-2">本日の出勤</label>
                <div className="flex gap-2 mb-2">
                  <select className="w-1/2 p-2 border border-slate-300 rounded text-slate-900 text-sm" value={timeStart} onChange={e => setTimeStart(e.target.value)}><option value="">開始</option>{timeOptions.map(t => <option key={t} value={t}>{t}</option>)}</select>
                  <span className="self-center text-slate-400">〜</span>
                  <select className="w-1/2 p-2 border border-slate-300 rounded text-slate-900 text-sm" value={timeEnd} onChange={e => setTimeEnd(e.target.value)}><option value="">終了</option>{timeOptions.map(t => <option key={t} value={t}>{t}</option>)}</select>
                </div>
                <div className="flex gap-2 mb-2">
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, today_hours: `即 ${prev.today_hours}` }))} className="bg-pink-100 text-pink-600 px-2 py-1 rounded text-xs font-bold hover:bg-pink-200">🔥 即をつける</button>
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, today_hours: '満 予約満了' }))} className="bg-slate-200 text-slate-600 px-2 py-1 rounded text-xs font-bold hover:bg-slate-300">🈵 満了</button>
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, today_hours: '' }))} className="bg-white border border-slate-300 text-slate-500 px-2 py-1 rounded text-xs hover:bg-slate-50">クリア</button>
                </div>
                <input placeholder="例: 即 12:00〜20:00" className="w-full border border-slate-300 rounded p-2 text-slate-900 font-bold bg-white" value={formData.today_hours} onChange={e => setFormData({ ...formData, today_hours: e.target.value })} />
              </div>

              {/* 特集タグ（カテゴリーごと） */}
              <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200 space-y-4">
                <label className="text-xs font-bold text-indigo-800 block">🏷 プレイリスト・特徴タグ</label>
                {TAG_CATEGORIES.map(category => (
                  <div key={category.title}>
                    <p className="text-xs font-bold text-slate-600 mb-2">{category.title}</p>
                    <div className="flex flex-wrap gap-2">
                      {category.tags.map(tag => (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`text-xs px-2 py-1 rounded border transition-colors ${
                            (formData.tags || []).includes(tag)
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* スリーサイズ */}
              <div className="flex gap-2">
                <input placeholder="T" className="w-full border border-slate-300 p-2 text-slate-900" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} />
                <input placeholder="C" className="w-full border border-slate-300 p-2 text-slate-900" value={formData.cup} onChange={e => setFormData({ ...formData, cup: e.target.value })} />
                <input placeholder="B" className="w-full border border-slate-300 p-2 text-slate-900" value={formData.bust} onChange={e => setFormData({ ...formData, bust: e.target.value })} />
                <input placeholder="W" className="w-full border border-slate-300 p-2 text-slate-900" value={formData.waist} onChange={e => setFormData({ ...formData, waist: e.target.value })} />
                <input placeholder="H" className="w-full border border-slate-300 p-2 text-slate-900" value={formData.hip} onChange={e => setFormData({ ...formData, hip: e.target.value })} />
              </div>

              {/* 詳細プロフィール */}
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 space-y-3">
                <label className="text-xs font-bold text-emerald-800 block">📋 詳細プロフィール</label>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[10px] font-bold text-slate-500">出身地</label><input className="w-full border border-slate-300 rounded p-2 text-slate-900 text-sm" value={formData.birthplace} onChange={e => setFormData({ ...formData, birthplace: e.target.value })} placeholder="例: 千葉県" /></div>
                  <div><label className="text-[10px] font-bold text-slate-500">星座</label>
                    <select className="w-full border border-slate-300 rounded p-2 text-slate-900 text-sm bg-white" value={formData.zodiac} onChange={e => setFormData({ ...formData, zodiac: e.target.value })}>
                      <option value="">選択</option>
                      {['牡羊座','牡牛座','双子座','蟹座','獅子座','乙女座','天秤座','蠍座','射手座','山羊座','水瓶座','魚座'].map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                  </div>
                  <div><label className="text-[10px] font-bold text-slate-500">血液型</label>
                    <select className="w-full border border-slate-300 rounded p-2 text-slate-900 text-sm bg-white" value={formData.blood_type} onChange={e => setFormData({ ...formData, blood_type: e.target.value })}>
                      <option value="">選択</option>
                      {['A型','B型','O型','AB型'].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div><label className="text-[10px] font-bold text-slate-500">お酒</label>
                    <select className="w-full border border-slate-300 rounded p-2 text-slate-900 text-sm bg-white" value={formData.alcohol} onChange={e => setFormData({ ...formData, alcohol: e.target.value })}>
                      <option value="">選択</option>
                      {['飲む','少し飲む','飲まない'].map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div><label className="text-[10px] font-bold text-slate-500">タバコ</label>
                    <select className="w-full border border-slate-300 rounded p-2 text-slate-900 text-sm bg-white" value={formData.tobacco} onChange={e => setFormData({ ...formData, tobacco: e.target.value })}>
                      <option value="">選択</option>
                      {['吸わない','吸う','時々'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div><label className="text-[10px] font-bold text-slate-500">似てる芸能人</label><input className="w-full border border-slate-300 rounded p-2 text-slate-900 text-sm" value={formData.similar_celeb} onChange={e => setFormData({ ...formData, similar_celeb: e.target.value })} placeholder="例: 橋本環奈" /></div>
                </div>
                <div><label className="text-[10px] font-bold text-slate-500">チャームポイント</label><input className="w-full border border-slate-300 rounded p-2 text-slate-900 text-sm" value={formData.charm_point} onChange={e => setFormData({ ...formData, charm_point: e.target.value })} placeholder="例: 笑った時のえくぼ" /></div>
                <div><label className="text-[10px] font-bold text-slate-500">前職</label><input className="w-full border border-slate-300 rounded p-2 text-slate-900 text-sm" value={formData.prev_job} onChange={e => setFormData({ ...formData, prev_job: e.target.value })} placeholder="例: アパレル店員" /></div>
              </div>

              {/* Q&A入力欄 */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 space-y-2">
                <label className="text-xs font-bold text-blue-800 block">💬 Q&A 一問一答</label>
                <div><label className="text-[10px] font-bold text-slate-500">Q. 趣味・特技は？</label><input className="w-full border border-slate-300 rounded p-2 text-slate-900 text-sm" value={formData.q_hobby} onChange={e => setFormData({ ...formData, q_hobby: e.target.value })} placeholder="例: カフェ巡り" /></div>
                <div><label className="text-[10px] font-bold text-slate-500">Q. 好きなタイプは？</label><input className="w-full border border-slate-300 rounded p-2 text-slate-900 text-sm" value={formData.q_type} onChange={e => setFormData({ ...formData, q_type: e.target.value })} placeholder="例: 優しくて面白い人" /></div>
                <div><label className="text-[10px] font-bold text-slate-500">Q. 実は〇〇フェチです</label><input className="w-full border border-slate-300 rounded p-2 text-slate-900 text-sm" value={formData.q_fetish} onChange={e => setFormData({ ...formData, q_fetish: e.target.value })} placeholder="例: 匂いフェチです" /></div>
                <div><label className="text-[10px] font-bold text-slate-500">Q. 感じやすいところは？</label><input className="w-full border border-slate-300 rounded p-2 text-slate-900 text-sm" value={formData.q_sensitive} onChange={e => setFormData({ ...formData, q_sensitive: e.target.value })} placeholder="例: 耳元で囁かれると..." /></div>
                <div><label className="text-[10px] font-bold text-slate-500">Q. 得意プレイは？</label><input className="w-full border border-slate-300 rounded p-2 text-slate-900 text-sm" value={formData.q_play} onChange={e => setFormData({ ...formData, q_play: e.target.value })} placeholder="例: 全身リップが得意です" /></div>
                <div><label className="text-[10px] font-bold text-slate-500">Q. 初めてのお客様に一言</label><input className="w-full border border-slate-300 rounded p-2 text-slate-900 text-sm" value={formData.q_first_time} onChange={e => setFormData({ ...formData, q_first_time: e.target.value })} placeholder="例: 緊張しないでくださいね" /></div>
                <div><label className="text-[10px] font-bold text-slate-500">Q. お休みの日は何してる？</label><input className="w-full border border-slate-300 rounded p-2 text-slate-900 text-sm" value={formData.q_off_day} onChange={e => setFormData({ ...formData, q_off_day: e.target.value })} placeholder="例: Netflix見てゴロゴロ" /></div>
                <div><label className="text-[10px] font-bold text-slate-500">Q. 将来の夢は？</label><input className="w-full border border-slate-300 rounded p-2 text-slate-900 text-sm" value={formData.q_dream} onChange={e => setFormData({ ...formData, q_dream: e.target.value })} placeholder="例: 海外旅行に行きたい！" /></div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">店長コメント</label>
                <textarea className="w-full border border-slate-300 rounded p-2 text-slate-900 bg-white" value={formData.schedule_comment} onChange={e => setFormData({ ...formData, schedule_comment: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-pink-500 block mb-1">❤️ 本人メッセージ</label>
                <textarea className="w-full border border-pink-200 rounded p-2 text-slate-900 bg-pink-50 focus:bg-white" value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} />
              </div>

              <button type="submit" disabled={uploading} className="w-full bg-pink-600 text-white p-3 rounded font-bold hover:bg-pink-500 shadow-md">{uploading ? '保存中...' : '保存する'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
