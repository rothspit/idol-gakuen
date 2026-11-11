/**
 * 営業日の「今日」: 朝8時未満は前日を当日として扱う（日付は 0:00 に正規化）。
 */
export function getBusinessToday(): Date {
  const now = new Date()
  if (now.getHours() < 8) {
    now.setDate(now.getDate() - 1)
  }
  now.setHours(0, 0, 0, 0)
  return now
}

export function getBusinessTodayString(): string {
  const d = getBusinessToday()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
