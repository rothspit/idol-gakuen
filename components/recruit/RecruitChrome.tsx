import type { ReactNode } from 'react'
import Link from 'next/link'

type RecruitNavProps = {
  backHref?: string
  backLabel?: string
  trailing?: ReactNode
}

export function RecruitNav({
  backHref = '/funabashi',
  backLabel = 'TOPへ',
  trailing,
}: RecruitNavProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-pink-100/80 bg-white/75 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link
          href="/recruit"
          className="text-lg font-extrabold tracking-wide text-[var(--recruit-rose)]"
        >
          アイドル<span className="text-pink-400">学園</span>
          <span className="ml-2 text-[10px] font-bold tracking-[0.2em] text-pink-300">
            RECRUIT
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {trailing}
          <Link
            href={backHref}
            className="rounded-full bg-slate-800 px-3 py-1.5 text-[11px] font-bold text-white"
          >
            {backLabel}
          </Link>
        </div>
      </div>
    </header>
  )
}

export function RecruitSparkles() {
  return (
    <>
      <span className="recruit-sparkle left-[12%] top-[18%]" style={{ animationDelay: '0s' }} />
      <span className="recruit-sparkle left-[78%] top-[12%]" style={{ animationDelay: '0.6s' }} />
      <span className="recruit-sparkle left-[88%] top-[36%]" style={{ animationDelay: '1.1s' }} />
      <span className="recruit-sparkle left-[18%] top-[48%]" style={{ animationDelay: '1.7s' }} />
    </>
  )
}

export function RecruitCta({
  href,
  children,
  variant = 'primary',
  external = false,
}: {
  href: string
  children: ReactNode
  variant?: 'primary' | 'line' | 'ghost'
  external?: boolean
}) {
  const base =
    'inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-extrabold tracking-wide transition-transform active:scale-[0.98]'

  const className =
    variant === 'line'
      ? `${base} recruit-pulse-soft bg-gradient-to-r from-[#06C755] to-[#05a848] text-white`
      : variant === 'ghost'
        ? `${base} border-2 border-pink-300 bg-white/70 text-[var(--recruit-rose-deep)] hover:bg-white`
        : `${base} recruit-shimmer bg-gradient-to-r from-[#ff7aa2] via-[#ff4d8d] to-[#f5c84c] text-white shadow-lg shadow-pink-300/50`

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    )
  }

  return (
    <a href={href} className={className}>
      {children}
    </a>
  )
}
