import { redirect } from 'next/navigation'

/** 旧秋葉原チャット予約フローは廃止。船橋ウェブ予約へ誘導。 */
export default function StudentCouncilPage() {
  redirect('/funabashi/reserve')
}
