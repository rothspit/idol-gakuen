import FunabashiPageClient from './FunabashiPageClient'
import ScheduleSectionServer from '@/components/ScheduleSectionServer'

export default function FunabashiPage() {
  return <FunabashiPageClient schedule={<ScheduleSectionServer />} />
}
