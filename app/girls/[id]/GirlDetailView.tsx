'use client'
import { useState, useEffect, useRef } from 'react'

import Link from 'next/link'
import ReviewForm from '@/components/ReviewForm'
import GirlPricingSectionIdol from '@/components/GirlPricingSectionIdol'
import IdolPlayList, { type IdolPlayItem } from '@/components/IdolPlayList'
import { resolveCastStatusBadge } from '@/lib/crm/wait-status'
import { pickImageUrl, isPlaceholderImage } from '@/lib/crm/idol-schedule'
import type { CastDetail, RelatedCast, TodaySchedule } from '@/lib/crm/cast-detail'

type GallerySlide = { candidates: string[] }

function buildGallerySlidesFromCast(girl: Record<string, unknown>): GallerySlide[] {
  const pushUnique = (list: string[], u: unknown) => {
    if (typeof u === 'string' && u.trim() && !isPlaceholderImage(u) && !list.includes(u)) {
      list.push(u)
    }
  }
  const primary: string[] = []
  pushUnique(primary, girl.idol_image_path)
  pushUnique(primary, girl.profile_image)
  pushUnique(primary, girl.image)
  const images = girl.images as string[] | undefined
  if (images?.[0]) pushUnique(primary, images[0])
  pushUnique(primary, girl.image1_url)

  const rawGallery = girl.gallery_images
  const gallery =
    typeof rawGallery === 'string' ? JSON.parse(rawGallery || '[]') : rawGallery || []

  const slides: GallerySlide[] = []
  if (primary.length > 0) slides.push({ candidates: primary })
  if (Array.isArray(gallery)) {
    for (const u of gallery) {
      if (typeof u === 'string' && u.trim() && !isPlaceholderImage(u)) {
        slides.push({ candidates: [u] })
      }
    }
  }
  return slides
}

function GalleryImageWithFallback({
  candidates,
  alt,
  className,
}: {
  candidates: string[]
  alt: string
  className?: string
}) {
  const [attempt, setAttempt] = useState(0)
  if (attempt >= candidates.length) {
    return (
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-slate-100 text-slate-400 text-xs p-4 text-center ${className ?? ''}`}
      >
        画像を準備中です
      </div>
    )
  }
  return (
    <img
      src={candidates[attempt]}
      alt={alt}
      className={className}
      onError={() => setAttempt((n) => n + 1)}
    />
  )
}

type Props = {
  // CRM 未提供の任意項目（出身地・Q&A など）は値があるときだけ表示する
  girl: CastDetail & Record<string, any>
  plays: IdolPlayItem[]
  relatedGirls: RelatedCast[]
  todaySchedule: TodaySchedule | null
}

export default function GirlDetailView({ girl, plays, relatedGirls, todaySchedule }: Props) {
  const reviews: any[] = []
  const [currentSlide, setCurrentSlide] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const sliderRef = useRef<HTMLDivElement | null>(null)

  // 複数枚時のみ：1枚目をビューポート中央にスクロール
  useEffect(() => {
    if (!girl) return
    const slides = buildGallerySlidesFromCast(girl as Record<string, unknown>)
    if (slides.length <= 1) return
    const el = sliderRef.current
    if (!el) return
    requestAnimationFrame(() => {
      const firstItem = el.querySelector<HTMLElement>('[data-slider-item="0"]')
      if (!firstItem) return
      const left = firstItem.offsetLeft
      const target = left - (el.clientWidth - firstItem.clientWidth) / 2
      el.scrollTo({ left: Math.max(0, target), behavior: 'auto' })
    })
  }, [girl?.id])

  // 画像URLを取得するヘルパー関数（一覧・関連キャスト用）
  const getImageUrl = (g: Record<string, unknown>) =>
    pickImageUrl(
      g.idol_image_path as string | null | undefined,
      g.profile_image as string | null | undefined,
      Array.isArray(g.images) ? (g.images[0] as string) : undefined,
      g.image as string | null | undefined,
      g.image1_url as string | null | undefined
    )

  const gallerySlides = buildGallerySlidesFromCast(girl as Record<string, unknown>)

  const scheduleBadge = resolveCastStatusBadge({
    waitStatus: todaySchedule?.wait_status,
    attendEndTime: todaySchedule?.attend_end_time,
    status: todaySchedule?.status || girl?.status,
    isSokudol: todaySchedule?.is_sokudol === true,
    useWaitStatus: true,
  })

  const goToSlide = (index: number) => {
    if (index < 0) setCurrentSlide(gallerySlides.length - 1)
    else if (index >= gallerySlides.length) setCurrentSlide(0)
    else setCurrentSlide(index)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const diff = touchStart - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToSlide(currentSlide + 1)
      else goToSlide(currentSlide - 1)
    }
    setTouchStart(null)
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-36 text-slate-800 font-sans">

      {/* 1. SEO対策: パンくずリスト */}
      <div className="bg-white px-4 py-2 text-[10px] text-slate-500 flex items-center gap-1 border-b border-slate-100">
        <Link href="/funabashi" className="hover:text-pink-600">トップ</Link>
        <span>&gt;</span>
        <Link href="/girls" className="hover:text-pink-600">在籍一覧</Link>
        <span>&gt;</span>
        <span className="font-bold text-slate-800">{girl?.name}</span>
      </div>

      {/* 2. メイン画像（1枚は中央配置、複数は横スクロール） */}
      <div className="w-full mx-auto my-6 px-4">
        {gallerySlides.length > 0 ? (
          gallerySlides.length === 1 ? (
            <div className="mx-auto w-full max-w-md">
              <div
                key={`${girl.id}-slide-0-${gallerySlides[0].candidates[0] ?? 0}`}
                className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-lg border border-white/50 bg-white"
              >
                <GalleryImageWithFallback
                  candidates={gallerySlides[0].candidates}
                  alt={`${girl?.name || ''}`}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-5 pt-12 z-10 pointer-events-none">
                  <h1 className="text-2xl font-bold text-white shadow-sm drop-shadow-md">
                    {girl?.name}
                  </h1>
                  <div className="text-white/90 text-sm font-bold drop-shadow-md">{girl?.age ? `${girl.age}歳` : ''}</div>
                  {girl?.is_attending && (
                    <div className="inline-flex items-center gap-1 bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow-lg border border-pink-400 mt-2">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                      本日出勤中！
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
          <div 
            ref={sliderRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scrollbar-hide w-full"
            onScroll={(e) => {
              const target = e.target as HTMLDivElement;
              // Assuming roughly 85% width per item, plus gap
              const itemWidth = target.scrollWidth / gallerySlides.length;
              const index = Math.round(target.scrollLeft / itemWidth);
              setCurrentSlide(index);
            }}
          >
            {gallerySlides.map((slide, i: number) => (
              <div
                key={`${girl.id}-slide-${i}-${slide.candidates[0] ?? i}`}
                data-slider-item={String(i)}
                className="flex-none w-[85%] sm:w-[60%] max-w-md snap-center relative shrink-0 aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border border-white/50 bg-white"
              >
                <GalleryImageWithFallback
                  candidates={slide.candidates}
                  alt={`${girl?.name || ''} ${i + 1}`}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                
                {/* 画像の上に名前を重ねておしゃれに */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-5 pt-12 z-10 pointer-events-none">
                  {i === 0 ? (
                    <h1 className="text-2xl font-bold text-white shadow-sm drop-shadow-md">{girl?.name}</h1>
                  ) : (
                    <p className="text-2xl font-bold text-white shadow-sm drop-shadow-md">{girl?.name}</p>
                  )}
                  <div className="text-white/90 text-sm font-bold drop-shadow-md">{girl?.age ? `${girl.age}歳` : ''}</div>
                  {girl?.is_attending && (
                    <div className="inline-flex items-center gap-1 bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow-lg border border-pink-400 mt-2">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                      本日出勤中！
                    </div>
                  )}
                </div>

                {/* 枚数表示 */}
                {gallerySlides.length > 1 && (
                  <div className="absolute top-3 right-3 bg-black/50 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-sm z-10 pointer-events-none">
                    {i + 1} / {gallerySlides.length}
                  </div>
                )}
              </div>
            ))}
          </div>
          )
        ) : (
          <div className="w-full max-w-sm mx-auto aspect-[3/4] bg-slate-100 flex items-center justify-center text-slate-400 rounded-2xl">
            No Image
          </div>
        )}
      </div>

      {/* 2.5 プロフィール動画 */}
      {girl.profile_video_path && (
        <div className="w-full max-w-sm mx-auto mb-8 px-4">
          <video 
            src={girl.profile_video_path} 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-auto rounded-2xl shadow-xl border border-white/50 shadow-pink-500/10" 
          />
        </div>
      )}

      <div className="max-w-xl mx-auto px-4 relative z-10 space-y-6">

        {/* 3. 本日の出勤時間（最重要！） */}
        <div className="bg-white rounded-2xl shadow-xl p-5 text-center transform transition-transform border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-purple-500"></div>
          <div className="text-xs font-bold text-slate-400 mb-1 tracking-widest uppercase">Today's Schedule</div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl animate-bounce">⏰</span>
            <div className="text-3xl font-black text-slate-800 tracking-tight">
              {girl.today_hours || <span className="text-slate-400 text-xl">時間未定</span>}
            </div>
          </div>
          {scheduleBadge.showBadge && scheduleBadge.type === 'immediate' && (
            <div className="text-[11px] font-black mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] rounded-full text-white bg-gradient-to-r from-pink-500 to-rose-500 shadow-sm shadow-pink-200 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              {scheduleBadge.text}
            </div>
          )}
          {scheduleBadge.showBadge && scheduleBadge.type === 'busy' && (
            <div className="text-[10px] font-bold mt-2 bg-slate-100 text-slate-600 inline-flex flex-col items-center gap-0.5 px-3 py-1.5 min-h-[44px] rounded border border-slate-200">
              <span>{scheduleBadge.text}</span>
              {scheduleBadge.subText ? (
                <span className="text-[9px] tabular-nums">{scheduleBadge.subText}</span>
              ) : null}
            </div>
          )}
        </div>

        {/* 4. 店長からの推薦コメント（CVRアップの鍵） */}
        {girl.manager_comment && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center gap-2">
            <span className="text-lg">👑</span>
            <h2 className="font-bold text-sm text-slate-700">店長の推薦コメント</h2>
          </div>
          <div className="p-4">
             <div className="flex gap-4">
               <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0 overflow-hidden border border-slate-300">
                 {/* 店長アイコン（仮） */}
                 <div className="w-full h-full flex items-center justify-center text-[10px]">店長</div>
               </div>
               <div className="flex-1">
                  <div className="bg-slate-100 rounded-xl rounded-tl-none p-3 text-sm text-slate-700 leading-relaxed relative whitespace-pre-wrap">
                    {girl.manager_comment}
                    <div className="absolute top-0 left-[-8px] w-0 h-0 border-t-[10px] border-r-[10px] border-t-slate-100 border-r-transparent"></div>
                  </div>
               </div>
             </div>
          </div>
        </div>
        )}

        {/* 5. プロフィール詳細データ */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2 border-l-4 border-pink-500 pl-3">
            プロフィール詳細
          </h2>

          {/* スリーサイズ */}
          <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-3 gap-2 text-center mb-4">
            <div>
              <div className="text-[10px] font-bold text-slate-400">BUST</div>
              <div className="font-black text-slate-700 text-lg">
                {girl.bust || '-'} <span className="text-xs font-normal text-slate-500">({girl.cup || '-'})</span>
              </div>
            </div>
            <div className="border-x border-slate-200">
              <div className="text-[10px] font-bold text-slate-400">WAIST</div>
              <div className="font-black text-slate-700 text-lg">{girl.waist || '-'}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400">HIP</div>
              <div className="font-black text-slate-700 text-lg">{girl.hip || '-'}</div>
            </div>
          </div>

          {/* 詳細テーブル */}
          <div className="grid grid-cols-2 gap-y-3 gap-x-8 mb-4">
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span className="text-xs font-bold text-slate-400">身長</span>
              <span className="font-bold text-slate-700">{girl.height ? `${girl.height}cm` : '-'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span className="text-xs font-bold text-slate-400">年齢</span>
              <span className="font-bold text-slate-700">{girl.age ? `${girl.age}歳` : '-'}</span>
            </div>
            {girl.birthplace && (
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-xs font-bold text-slate-400">出身地</span>
                <span className="font-bold text-slate-700">{girl.birthplace}</span>
              </div>
            )}
            {girl.blood_type && (
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-xs font-bold text-slate-400">血液型</span>
                <span className="font-bold text-slate-700">{girl.blood_type}</span>
              </div>
            )}
            {girl.zodiac && (
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-xs font-bold text-slate-400">星座</span>
                <span className="font-bold text-slate-700">{girl.zodiac}</span>
              </div>
            )}
            {girl.similar_celeb && (
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-xs font-bold text-slate-400">似てる芸能人</span>
                <span className="font-bold text-slate-700">{girl.similar_celeb}</span>
              </div>
            )}
            {girl.charm_point && (
              <div className="col-span-2 flex justify-between border-b border-slate-100 pb-1">
                <span className="text-xs font-bold text-slate-400">チャームポイント</span>
                <span className="font-bold text-slate-700">{girl.charm_point}</span>
              </div>
            )}
            {girl.alcohol && (
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-xs font-bold text-slate-400">お酒</span>
                <span className="font-bold text-slate-700">{girl.alcohol}</span>
              </div>
            )}
            {girl.tobacco && (
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-xs font-bold text-slate-400">タバコ</span>
                <span className="font-bold text-slate-700">{girl.tobacco}</span>
              </div>
            )}
          </div>

          {/* 特徴タグ */}
          {girl.tags && girl.tags.length > 0 && (
            <div className="mt-4">
              <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Features</div>
              <div className="flex flex-wrap gap-2">
                {girl.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 px-3 py-1 rounded-full border border-pink-200 font-bold shadow-sm"
                  >
                    {tag}
                  </span>
                ))}
            </div>
            </div>
          )}
        </div>

        {/* 5.5 料金表 + 概算 */}
        <GirlPricingSectionIdol girl={girl as Record<string, unknown>} />

        {/* 5.6 プレイリスト（CRM public_profile.plays） */}
        <IdolPlayList plays={plays} />

        {/* 6. 本人からのメッセージ */}
        {girl.girl_comment && (
          <div className="bg-pink-50 rounded-2xl p-6 shadow-sm relative border border-pink-100">
            <div className="absolute -top-3 left-6 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              MESSAGE
            </div>
            <div className="text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
              {girl.girl_comment}
            </div>
            <div className="text-right mt-2 text-pink-400 text-sm">
              From {girl.name}
            </div>
          </div>
        )}

        {/* 6.5 Q&A 一問一答 */}
        {(girl.q_hobby || girl.q_type || girl.q_fetish || girl.q_sensitive || girl.q_play || girl.q_first_time || girl.q_off_day || girl.q_dream) && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2 border-l-4 border-blue-400 pl-3">
              教えて！Q&A
            </h2>
            <div className="space-y-4">
              {girl.q_hobby && (
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-blue-400 block mb-1">Q. 趣味・特技は？</span>
                  <div className="text-sm text-slate-700">{girl.q_hobby}</div>
                </div>
              )}
              {girl.q_type && (
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-pink-400 block mb-1">Q. 好きなタイプは？</span>
                  <div className="text-sm text-slate-700">{girl.q_type}</div>
                </div>
              )}
              {girl.q_fetish && (
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-purple-400 block mb-1">Q. 実は〇〇フェチです</span>
                  <div className="text-sm text-slate-700">{girl.q_fetish}</div>
                </div>
              )}
              {girl.q_sensitive && (
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-red-400 block mb-1">Q. 感じやすいところは？</span>
                  <div className="text-sm text-slate-700">{girl.q_sensitive}</div>
                </div>
              )}
              {girl.q_play && (
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-orange-400 block mb-1">Q. 得意プレイは？</span>
                  <div className="text-sm text-slate-700">{girl.q_play}</div>
                </div>
              )}
              {girl.q_first_time && (
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-green-500 block mb-1">Q. 初めてのお客様に一言</span>
                  <div className="text-sm text-slate-700">{girl.q_first_time}</div>
                </div>
              )}
              {girl.q_off_day && (
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-cyan-500 block mb-1">Q. お休みの日は何してる？</span>
                  <div className="text-sm text-slate-700">{girl.q_off_day}</div>
                </div>
              )}
              {girl.q_dream && (
                <div>
                  <span className="text-xs font-bold text-amber-500 block mb-1">Q. 将来の夢は？</span>
                  <div className="text-sm text-slate-700">{girl.q_dream}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 8. 口コミセクション */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2 border-l-4 border-yellow-400 pl-3">
            <span className="text-yellow-500">⭐️</span> 口コミ
          </h2>

          {reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </span>
                      <span className="text-xs text-slate-500">{review.rating}点</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.title && (
                    <h4 className="font-bold text-slate-800 mb-2">{review.title}</h4>
                  )}
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{review.content}</p>
                  <p className="text-xs text-slate-400 mt-2 text-right">— {review.nickname}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl p-6 text-center text-slate-400 text-sm border border-dashed border-slate-200">
              まだ口コミがありません
            </div>
          )}

          {/* 口コミ投稿フォーム */}
          <ReviewForm girlId={String(girl.id)} />
        </div>

        {/* 9. 直帰率を下げる「他のおすすめキャスト」 */}
        {relatedGirls.length > 0 && (
          <div className="pt-4 border-t border-slate-200">
            <h3 className="font-bold text-slate-600 mb-3 text-sm">この子を見た人はこんな子も見ています</h3>
            <div className="grid grid-cols-3 gap-2">
              {relatedGirls.map((other) => {
                const otherImage = getImageUrl(other)
                return (
                  <Link href={`/girls/${other.id}`} key={other.id} className="block group">
                    <div className="aspect-[3/4] rounded-lg overflow-hidden bg-slate-200 mb-1 relative">
                      {otherImage ? (
                        <img src={otherImage} alt={other.name} loading="lazy" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"/>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">No Img</div>
                      )}
                      {other.is_attending && <div className="absolute top-0 left-0 w-2 h-2 bg-green-500 rounded-full m-1 border border-white"></div>}
                    </div>
                    <p className="text-[10px] font-bold text-slate-700 truncate">{other.name}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

      </div>

      {/* 7. 追尾フッター（CVエリア） */}
      <div className="fixed bottom-0 left-0 w-full z-50 pointer-events-none">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-md border-t border-white/40 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] pb-safe"></div>
        <div className="max-w-xl mx-auto relative pointer-events-auto px-4 py-3 pb-safe flex gap-3">

          <a href="tel:05017459665" className="flex-1 bg-white border-2 border-pink-500 text-pink-600 rounded-full flex flex-col items-center justify-center py-2 shadow-lg active:scale-95 transition-transform hover:bg-pink-50">
            <div className="text-[10px] font-bold">電話で空き確認</div>
            <div className="text-lg font-black leading-none tracking-tighter">050-1745-9665</div>
          </a>

          <Link href={`/funabashi/reserve?cast=${encodeURIComponent(String(girl.id))}`} className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full flex items-center justify-center gap-2 py-2 shadow-lg active:scale-95 transition-transform hover:opacity-90 ring-2 ring-white ring-offset-2 ring-offset-blue-200">
            <div className="text-2xl animate-pulse">💬</div>
            <div className="flex flex-col leading-none">
               <div className="text-[10px] font-bold opacity-90">待たずに連絡</div>
               <div className="font-black text-lg">今すぐ指名</div>
            </div>
          </Link>

        </div>
      </div>
    </div>
  )
}
