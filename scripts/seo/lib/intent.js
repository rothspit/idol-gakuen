/**
 * 予約・来店につながりやすいクエリ（アイドル学園）
 */

const DECISION_SIGNALS = [
  'デリヘル',
  'おすすめ',
  '人気',
  '口コミ',
  '評判',
  '料金',
  '値段',
  '予約',
  'ホテル',
  '出張',
  '即案内',
  '初心者',
  '初めて',
  '船橋',
  '西船橋',
  '津田沼',
  '市川',
  '幕張',
  '制服',
  'コスプレ',
  '女子大生',
  '選び方',
  '比較',
  'ランキング',
  'アイドル学園',
];

const LOW_INTENT = [
  'とは',
  '意味',
  '英語',
  '画像',
  'イラスト',
  'wiki',
  'wikipedia',
  'ニュース',
  '株価',
  '無料動画',
  'エロ動画',
];

export function scoreInquiryIntent(query, { hasArea = false, type = null } = {}) {
  const q = String(query || '').trim();
  const reasons = [];
  let score = 0;

  if (!q) return { isInquiryIntent: false, score: 0, reasons: ['empty'] };

  for (const weak of LOW_INTENT) {
    if (q.includes(weak)) {
      return { isInquiryIntent: false, score: 0, reasons: [`low_intent:${weak}`] };
    }
  }

  const hits = DECISION_SIGNALS.filter((s) => q.includes(s));
  if (hits.length) {
    score += Math.min(hits.length * 25, 60);
    reasons.push(`decision:${hits.slice(0, 3).join(',')}`);
  }
  if (hasArea) {
    score += 15;
    reasons.push('has_area');
  }
  if (type === 'area' || type === 'topical') score += 5;

  return {
    isInquiryIntent: score >= 40,
    score,
    reasons,
  };
}
