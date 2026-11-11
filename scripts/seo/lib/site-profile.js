/**
 * アイドル学園 SEO運用プロファイル
 */

export const SITE_SEO_PROFILE = {
  siteKey: 'idol-gakuen',
  siteName: 'アイドル学園',
  siteUrl: 'https://idolgakuen.jp',
  verticalLabel: '船橋デリヘル',
  inquiryLabel: '電話予約・WEB予約',
  sisterMedia: [],
  distribution: {
    xTwitter: 'none',
    primary: 'organic_search + owned_landing',
  },
  dailyArticleLimit: 3,
  blogPathPrefix: '/blog',
  castAgePolicy: '18歳以上（高校生在籍不可）',
  cta: {
    lineUrl: null,
    applyAnchor: '/funabashi',
    recruitPath: '/recruit',
    reservePath: '/funabashi/reserve',
    phone: '050-1745-9665',
    stores: [{ label: '船橋', href: '/funabashi' }],
  },
};

export const CROSS_LINK_POLICY = {
  allow: ['運営紹介', '記事本文で自然な店舗・ガイドリンク', 'シリーズ内の相互リンク'],
  deny: [
    '他ブランド（人妻の蜜等）への機械的相互リンク',
    'deli-rank / mensesthe-rank への機械的リンク量産',
  ],
};
