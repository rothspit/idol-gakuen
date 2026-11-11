import { IDOL_STORE_ID } from '@/lib/idol-reservation'
import {
  fetchCrmCasts,
  fetchCrmScheduleForDate,
  mergeScheduleWithCasts,
  type DisplayCast,
} from '@/lib/crm/idol-schedule'

/** CRM schedules のみ（Supabase 併用なし） */
export async function getScheduleDisplay(
  date: string,
  storeId = IDOL_STORE_ID
): Promise<DisplayCast[]> {
  const [scheduleEntries, crmCasts] = await Promise.all([
    fetchCrmScheduleForDate(date, storeId),
    fetchCrmCasts(storeId),
  ])

  return mergeScheduleWithCasts(scheduleEntries, crmCasts)
}
