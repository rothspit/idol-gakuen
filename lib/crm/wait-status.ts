/** wait_status ベースの即ドル／授業中バッジ（アイドル学園） */

export type CastStatusBadge = {
  type: 'immediate' | 'busy' | 'closed' | 'time' | 'normal'
  text: string
  subText?: string
  color: string
  showBadge: boolean
  dimCard: boolean
}

const IMMEDIATE_COLOR =
  'bg-gradient-to-r from-pink-400 to-rose-400 text-white animate-pulse shadow-md shadow-pink-200'
const BUSY_COLOR = 'bg-white/95 text-slate-600 border border-slate-200 backdrop-blur-sm'
const TIME_COLOR = 'bg-white/95 border text-pink-600 border-pink-300 shadow-sm backdrop-blur-sm'
const NORMAL_COLOR = 'bg-white/95 border-2 border-pink-200 text-pink-400 backdrop-blur-sm'

function formatNextTime(attendEndTime?: string | null): string | undefined {
  if (!attendEndTime) return undefined
  const m = attendEndTime.match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return undefined
  return `${m[1].padStart(2, '0')}:${m[2]}`
}

function immediateLabel(attendEndTime?: string | null): string {
  if (attendEndTime === '即ご案内OK' || attendEndTime === '即ドル') return attendEndTime
  return '即ドル'
}

function resolveLegacyStatusBadge(status?: string): CastStatusBadge {
  const s = status?.trim()
  if (!s) {
    return { type: 'normal', text: '時間未定', color: NORMAL_COLOR, showBadge: true, dimCard: false }
  }
  if (s === '即案内可能' || s === '待機中') {
    return {
      type: 'immediate',
      text: '即ご案内OK',
      color: IMMEDIATE_COLOR,
      showBadge: true,
      dimCard: false,
    }
  }
  if (s === '接客中') {
    return {
      type: 'busy',
      text: '授業中',
      color: BUSY_COLOR,
      showBadge: true,
      dimCard: true,
    }
  }
  if (s === '出勤' || s === '登校' || s === '登校中') {
    return {
      type: 'time',
      text: s === '登校中' ? '出勤' : s,
      color: TIME_COLOR,
      showBadge: false,
      dimCard: false,
    }
  }
  return { type: 'time', text: s, color: TIME_COLOR, showBadge: false, dimCard: false }
}

export function resolveCastStatusBadge(input: {
  waitStatus?: number | null
  attendEndTime?: string | null
  status?: string
  /** CRM schedules の is_sokudol。即姫表示の正本 */
  isSokudol?: boolean
  /** 本日タブのみ true。未来日は wait_status を無視 */
  useWaitStatus?: boolean
}): CastStatusBadge {
  const { waitStatus, attendEndTime, status, isSokudol, useWaitStatus = true } = input

  if (useWaitStatus) {
    // 即姫は CRM の is_sokudol が true のときのみ（wait_status=1 だけでは出さない）
    if (isSokudol === true) {
      return {
        type: 'immediate',
        text: immediateLabel(attendEndTime),
        color: IMMEDIATE_COLOR,
        showBadge: true,
        dimCard: false,
      }
    }

    if (typeof waitStatus === 'number' && waitStatus > 0) {
      switch (waitStatus) {
        case 2: {
          const next = formatNextTime(attendEndTime)
          return {
            type: 'busy',
            text: '授業中',
            subText: next ? `次回${next}より` : undefined,
            color: BUSY_COLOR,
            showBadge: true,
            dimCard: true,
          }
        }
        case 3:
          return { type: 'closed', text: '下校', color: '', showBadge: false, dimCard: true }
        default:
          break
      }
    }
  }

  return resolveLegacyStatusBadge(status)
}
