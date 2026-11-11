import { CAST_AGE_POLICY, STORE } from '@/lib/seo/site'

export const RECRUIT_LINE = 'https://line.me/ti/p/Y_yyUiTXuW'
export const RECRUIT_PHONE = STORE.phone
export const RECRUIT_PHONE_TEL = STORE.phoneTel
export const RECRUIT_AGE = CAST_AGE_POLICY

export const CAST_HIGHLIGHTS = [
  {
    title: '全額日払いOK',
    desc: '働いたその日がお給料日。急な出費でも安心です。',
    mark: '♡',
  },
  {
    title: '完全送迎つき',
    desc: '行きも帰りも無料送迎。身バレ対策もしっかり。',
    mark: '★',
  },
  {
    title: '衣装・メイク貸出',
    desc: '手ぶらで出勤OK。可愛い制服・コスを多数ご用意。',
    mark: '✦',
  },
  {
    title: '週1・短時間OK',
    desc: '学校や本業と両立しやすい自由シフトです。',
    mark: '♪',
  },
] as const

export const CAST_FLOW = [
  { title: 'LINEでかんたん応募', desc: '質問だけでも大歓迎。まずは気軽にどうぞ。' },
  { title: 'オンライン or 対面面談', desc: '私服OK・秘密厳守。不安なことはここで解消。' },
  { title: '体験デビュー（希望者）', desc: '無理のない短時間からスタートできます。' },
  { title: 'アイドル活動スタート', desc: 'シフトも働き方も、いつでも相談OK。' },
] as const

export const STAFF_ROLES = [
  {
    title: '送迎ドライバー',
    desc: 'キャストの安心送迎。普通免許必須・経験者優遇。',
  },
  {
    title: '受付・電話対応',
    desc: 'ご予約の案内やスケジュール調整など、店舗の顔になるお仕事。',
  },
  {
    title: '事務・運営サポート',
    desc: 'データ入力や各種サポート。未経験からでも丁寧に教えます。',
  },
] as const

export const STAFF_HIGHLIGHTS = [
  {
    title: '未経験歓迎',
    desc: '業界・職種どちらも初めてでも大丈夫。研修あり。',
    mark: '♡',
  },
  {
    title: 'シフト相談OK',
    desc: '曜日・時間はできる限り合わせます。',
    mark: '★',
  },
  {
    title: '正社員・アルバイト',
    desc: 'ポジションに応じて雇用形態をご相談。',
    mark: '✦',
  },
] as const
