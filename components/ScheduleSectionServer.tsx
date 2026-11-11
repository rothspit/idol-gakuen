import { getScheduleDisplay } from '@/lib/crm/schedule-display'
import { getBusinessTodayString } from '@/lib/business-date'
import { IDOL_STORE_ID } from '@/lib/idol-reservation'
import ScheduleSection from '@/components/ScheduleSection'

type ScheduleSectionServerProps = {
  storeId?: number
}

export default async function ScheduleSectionServer({
  storeId = IDOL_STORE_ID,
}: ScheduleSectionServerProps) {
  const today = getBusinessTodayString()
  let initialCasts: Awaited<ReturnType<typeof getScheduleDisplay>> = []

  try {
    initialCasts = await getScheduleDisplay(today, storeId)
  } catch (err) {
    console.error('ScheduleSectionServer:', err)
  }

  return (
    <ScheduleSection initialDate={today} initialCasts={initialCasts} storeId={storeId} />
  )
}
