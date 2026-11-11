import type { CastStatusBadge } from '@/lib/crm/wait-status'

type Props = {
  badge: CastStatusBadge
  className?: string
  size?: 'sm' | 'md'
  /** pill=写真上 / chip=名前の下 */
  variant?: 'pill' | 'chip'
}

export default function WaitStatusBadge({
  badge,
  className = '',
  size = 'md',
  variant = 'pill',
}: Props) {
  if (!badge.showBadge) return null

  const pillClass =
    size === 'sm'
      ? 'text-[10px] px-2.5 py-1.5 min-h-[36px] rounded-full'
      : 'text-xs px-3 py-2 min-h-[44px] rounded-full'

  const chipClass =
    size === 'sm'
      ? 'text-[10px] px-2 py-1 min-h-[28px] rounded-lg'
      : 'text-xs px-2.5 py-1.5 min-h-[32px] rounded-lg'

  return (
    <div
      className={`inline-flex flex-col items-start justify-center font-black leading-tight z-20 ${variant === 'chip' ? chipClass : pillClass} ${badge.color} ${className}`}
    >
      <span>{badge.text}</span>
      {badge.subText ? (
        <span className="text-[9px] font-bold opacity-90 mt-0.5 tabular-nums">{badge.subText}</span>
      ) : null}
    </div>
  )
}
