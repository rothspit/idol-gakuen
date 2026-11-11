/**
 * クエリ意図分類（アイドル学園）
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { scoreInquiryIntent } from './intent.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '../../..');
const ARTICLES_DIR = path.join(ROOT, 'content', 'articles');

const AREA_ALIASES = [
  { patterns: ['西船橋', '西船'], slug: 'nishifunabashi', label: '西船橋' },
  { patterns: ['船橋'], slug: 'funabashi', label: '船橋' },
  { patterns: ['津田沼'], slug: 'tsudanuma', label: '津田沼' },
  { patterns: ['市川'], slug: 'ichikawa', label: '市川' },
  { patterns: ['本八幡'], slug: 'motoyawata', label: '本八幡' },
  { patterns: ['幕張', '海浜幕張'], slug: 'makuhari', label: '幕張' },
  { patterns: ['千葉'], slug: 'chiba', label: '千葉' },
];

const BRAND_NOISE = /idolgakuen\.jp|^アイドル学園$|サイトマップ|会社概要のみ/i;

export function classifyQuery(query) {
  const q = String(query || '').trim();
  if (!q || BRAND_NOISE.test(q)) {
    return { type: 'skip', reason: 'brand_or_empty', query: q };
  }
  if (/^(アイドル学園|idol.?gakuen)$/i.test(q)) {
    return { type: 'skip', reason: 'brand_or_empty', query: q };
  }

  const area = matchArea(q);
  const isCompare = /どっち|比較|vs|versus|違い|ランキング/.test(q);
  const isHowTo =
    /始め|初めて|初心者|流れ|FAQ|不安|選び方|料金|値段|予約|ホテル|出張|口コミ|評判|おすすめ|制服|コスプレ/.test(
      q,
    );

  let result;
  if (isCompare) {
    result = {
      type: 'comparison',
      query: q,
      area,
      suggestedRoute: '/blog/{slug}',
      action: 'new_guide_draft',
    };
  } else if (area) {
    result = {
      type: 'area',
      query: q,
      area,
      suggestedRoute: '/blog/{slug}',
      action: 'new_area_guide_draft',
    };
  } else if (isHowTo) {
    result = {
      type: 'topical',
      query: q,
      area: null,
      suggestedRoute: '/blog/{slug}',
      action: 'new_guide_draft',
    };
  } else {
    result = {
      type: 'topical',
      query: q,
      area: null,
      suggestedRoute: '/blog/{slug}',
      action: 'new_guide_draft',
    };
  }

  const intent = scoreInquiryIntent(q, { hasArea: Boolean(area), type: result.type });
  return { ...result, intent, priority: intent.score >= 70 ? 'high' : intent.score >= 40 ? 'medium' : 'low' };
}

function matchArea(q) {
  for (const a of AREA_ALIASES) {
    if (a.patterns.some((p) => q.includes(p))) return { slug: a.slug, label: a.label };
  }
  return null;
}

export function slugifyKeyword(query) {
  return String(query || '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[\/\\?%*:|"<>]/g, '')
    .slice(0, 80);
}

export function loadExistingArticleQueries() {
  const set = new Set();
  if (fs.existsSync(ARTICLES_DIR)) {
    for (const file of fs.readdirSync(ARTICLES_DIR)) {
      if (!file.endsWith('.md')) continue;
      const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf8');
      const m = raw.match(/\*\*target_query\*\*:\s*(.+)/);
      if (m) set.add(m[1].trim());
    }
  }
  return set;
}

export function alreadyCovered(query, existing) {
  const q = String(query || '').trim();
  if (existing.has(q)) return true;
  const needle = slugifyKeyword(q);
  for (const ex of existing) {
    if (String(ex).includes(q) || slugifyKeyword(ex) === needle) return true;
  }
  return false;
}




