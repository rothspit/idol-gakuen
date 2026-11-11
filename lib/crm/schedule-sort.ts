import type { DisplayCast } from '@/lib/crm/idol-schedule'
import { resolveCastStatusBadge } from '@/lib/crm/wait-status'

/** 小さいほど上に表示 */
function getCastSortPriority(cast: DisplayCast, useWaitStatus: boolean): number {
  const badge = resolveCastStatusBadge({
    waitStatus: cast.wait_status,
    attendEndTime: cast.attend_end_time,
    status: cast.status,
    isSokudol: cast.is_sokudol,
    useWaitStatus,
  })

  if (badge.type === 'immediate') return 0
  if (badge.type === 'busy') return 10
  if (badge.type === 'closed' || isShiftEnded(cast, useWaitStatus)) return 40
  if (isUpcoming(cast)) return 30
  return 20
}

function parseTimeToday(hhmm: string): Date | null {
  const m = hhmm.match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return null
  const d = new Date()
  d.setHours(Number(m[1]), Number(m[2]), 0, 0)
  return d
}

function isShiftEnded(cast: DisplayCast, useWaitStatus: boolean): boolean {
  if (useWaitStatus && cast.wait_status === 3) return true
  if (!cast.end_time) return false
  const end = parseTimeToday(cast.end_time)
  if (!end) return false
  return new Date() > end
}

function isUpcoming(cast: DisplayCast): boolean {
  if (!cast.start_time) return false
  const start = parseTimeToday(cast.start_time)
  if (!start) return false
  return new Date() < start
}

function timeSortKey(cast: DisplayCast): string {
  return cast.start_time || cast.today_hours || '99:99'
}

export function sortScheduleCasts(casts: DisplayCast[], useWaitStatus: boolean): DisplayCast[] {
  if (!useWaitStatus) {
    return [...casts].sort((a, b) => timeSortKey(a).localeCompare(timeSortKey(b)))
  }

  return [...casts].sort((a, b) => {
    const pa = getCastSortPriority(a, useWaitStatus)
    const pb = getCastSortPriority(b, useWaitStatus)
    if (pa !== pb) return pa - pb
    return timeSortKey(a).localeCompare(timeSortKey(b))
  })
}
