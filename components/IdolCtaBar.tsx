'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { STORE } from '@/lib/seo/site'

const HIDDEN_PREFIXES = ['/admin', '/student-council', '/tiara']

const ICO = {
  girls: 'M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0ZM4 20.2C4.8 16.9 8 15 12 15s7.2 1.9 8 5.2',
  reserve: 'M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm3 8h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01',
  recruit: 'M4 8h16v11H4V8Zm4-3h8v3H8V5Z',
  login: 'M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 9a7 7 0 0 1 14 0',
}

function Icon({ d, size = 22 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d={d} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function openStaffChat(pathname: string | null) {
  const source = pathname?.includes('/recruit/staff')
    ? 'staff_recruit'
    : pathname?.includes('/recruit')
      ? 'recruit'
      : 'guest'
  window.dispatchEvent(new CustomEvent('idol-open-chat', { detail: { source } }))
}

function navClass(active: boolean) {
  const color = active ? 'text-[#d4527a]' : 'text-[#78716c] hover:text-[#d4527a]'
  return `flex flex-1 flex-col items-center justify-center px-1 py-1.5 min-w-0 transition-colors ${color}`
}

export default function IdolCtaBar() {
  const pathname = usePathname()
  if (HIDDEN_PREFIXES.some((p) => pathname?.startsWith(p))) return null

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-[9999] border-t border-pink-200/50 bg-white/95 backdrop-blur shadow-[0_-4px_12px_-2px_rgba(212,82,122,0.08)] px-2 pt-2 pb-[max(0.45rem,env(safe-area-inset-bottom))]">
        <div className="flex items-end justify-between max-w-md mx-auto gap-0.5">
          <Link
            href="/girls"
            className={navClass(Boolean(pathname?.startsWith('/girls') || pathname?.includes('/cast')))}
          >
            <Icon d={ICO.girls} />
            <span className="text-[10px] font-semibold mt-0.5 leading-tight">女の子</span>
          </Link>

          <Link href="/funabashi/reserve" className={navClass(Boolean(pathname?.includes('/reserve')))}>
            <Icon d={ICO.reserve} />
            <span className="text-[10px] font-semibold mt-0.5 leading-tight">予約する</span>
          </Link>

          <div className="flex items-end justify-center gap-1.5 -mt-7 mx-0.5 shrink-0">
            <a
              href={`tel:${STORE.phoneTel}`}
              className="flex flex-col items-center justify-center active:scale-95 transition-transform"
              aria-label={`電話 ${STORE.phone}`}
            >
              <span className="bg-[#d4527a] text-white w-[4rem] h-[4rem] rounded-full shadow-lg shadow-[#d4527a]/35 flex items-center justify-center ring-4 ring-white">
                <svg width={26} height={26} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
              </span>
              <span className="font-bold text-[10px] text-[#d4527a] mt-1.5 tracking-wide leading-tight text-center min-h-[2.2em]">
                電話する
              </span>
            </a>
            <button
              type="button"
              onClick={() => openStaffChat(pathname)}
              className="flex flex-col items-center justify-center active:scale-95 transition-transform"
              aria-label="スタッフとチャット"
            >
              <span className="bg-[#d4527a] text-white w-[4rem] h-[4rem] rounded-full shadow-lg shadow-[#d4527a]/35 flex items-center justify-center ring-4 ring-white">
                <svg width={26} height={26} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                </svg>
              </span>
              <span className="font-bold text-[10px] text-[#d4527a] mt-1.5 tracking-wide leading-tight text-center min-h-[2.2em]">
                スタッフと<br />チャット
              </span>
            </button>
          </div>

          <Link
            href="/recruit/cast"
            className={navClass(Boolean(pathname?.includes('/recruit')))}
          >
            <Icon d={ICO.recruit} />
            <span className="text-[10px] font-semibold mt-0.5 leading-tight">求人</span>
          </Link>

          <Link
            href="/login"
            className={navClass(Boolean(pathname?.startsWith('/login') || pathname?.startsWith('/mypage')))}
          >
            <Icon d={ICO.login} />
            <span className="text-[10px] font-semibold mt-0.5 leading-tight">
              {pathname?.startsWith('/mypage') ? 'マイページ' : 'ログイン'}
            </span>
          </Link>
        </div>
      </nav>
      <style>{`body { padding-bottom: 96px !important; }`}</style>
    </>
  )
}
