export const SITE_URL = 'https://idolgakuen.jp'

/** 風営法準拠：18歳以上かつ高校非在籍のみ採用 */
export const CAST_AGE_POLICY = '18歳以上（高校生在籍不可）'

export const STORE = {
  name: 'アイドル学園 船橋',
  brand: 'アイドル学園',
  phone: '050-1745-9665',
  phoneTel: '05017459665',
  area: '船橋',
  prefecture: '千葉県',
  priceFrom: '18,000',
  hours: '10:00〜翌4:00',
  ogImage: '/idol_top.jpg',
} as const

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
