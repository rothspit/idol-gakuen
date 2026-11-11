/**
 * 記事下書き1本の生成 — アイドル学園
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { classifyQuery, slugifyKeyword } from './classify.js';
import { isoDate } from './gsc.js';
import { generateArticleBody } from './llm.js';
import { SITE_SEO_PROFILE } from './site-profile.js';
import { generateArticleThumbnailPng } from './thumbnail.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '../../..');
export const ARTICLES_DIR = path.join(ROOT, 'content', 'articles');
const SITE_URL = SITE_SEO_PROFILE.siteUrl;
const CTA = SITE_SEO_PROFILE.cta;
const BLOG = SITE_SEO_PROFILE.blogPathPrefix || '/blog';
const AGE = SITE_SEO_PROFILE.castAgePolicy;

export function nextArticleNumber() {
  let max = 0;
  if (!fs.existsSync(ARTICLES_DIR)) return 1;
  for (const file of fs.readdirSync(ARTICLES_DIR)) {
    const m = file.match(/^(\d+)-/);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max + 1;
}

export function draftExistsForQuery(query) {
  const needle = slugifyKeyword(query);
  if (!fs.existsSync(ARTICLES_DIR)) return null;
  for (const file of fs.readdirSync(ARTICLES_DIR)) {
    if (!file.endsWith('.md')) continue;
    if (file.includes(needle) || file.includes('gsc-') || file.includes('daily-')) {
      const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf8');
      if (raw.includes(query) || raw.includes(`**target_query**: ${query}`)) return file;
    }
  }
  return null;
}

export function opportunityFromQuery(query, extras = {}) {
  const classified = classifyQuery(query);
  if (classified.type === 'skip' && classified.reason === 'brand_or_empty') return classified;
  if (classified.type === 'skip') {
    return {
      type: 'topical',
      query,
      area: null,
      action: 'new_guide_draft',
      priority: extras.priority || 'medium',
      alreadyCovered: false,
      intent: classified.intent || { isInquiryIntent: true, score: 50, reasons: ['queue_override'] },
    };
  }
  return { ...classified, priority: extras.priority || classified.priority || 'medium', alreadyCovered: false };
}

function buildOutline(opp) {
  if (opp.type === 'area' && opp.area) {
    return [
      `${opp.area.label}でデリヘルを選ぶポイント`,
      'ホテル・ご自宅利用のコツ',
      '予約の流れ',
      '初めての方向けの安心ポイント',
      'よくある質問',
    ];
  }
  return [
    `${opp.query}で調べている人が知りたいこと`,
    '店舗・エリアの見方',
    '予約前のチェックリスト',
    'よくある質問',
  ];
}

function buildTemplateBody({ title, query, outline }) {
  const sections = outline
    .map(
      (h) => `## ${h}

（下書き）「${query}」に関連するポイントを追記してください。在籍は${AGE}。JK表現はコスプレコンセプトである旨を混同させないこと。
`,
    )
    .join('\n');

  return `# ${title}

検索クエリ「${query}」向けのガイドです。アイドル学園は船橋エリアのデリヘルです（在籍: ${AGE}）。

${sections}
## この記事のまとめ

「${query}」でお探しの方は、出勤状況を確認のうえご予約ください。
- [船橋トップ](/funabashi)
- [WEB予約](/funabashi/reserve)
- 電話: ${CTA.phone || ''}
`;
}

export async function createArticleDraft({
  query,
  opp = null,
  articleNumber,
  execute = false,
  source = 'daily-queue',
  force = false,
}) {
  const opportunity = opp || opportunityFromQuery(query);
  if (opportunity.type === 'skip' && opportunity.reason === 'brand_or_empty') {
    return { skipped: true, reason: opportunity.reason };
  }

  const existing = draftExistsForQuery(query);
  if (existing && !force) return { skipped: true, reason: 'exists', existing };

  const year = new Date().getFullYear();
  const slug = `${source === 'daily-queue' ? 'daily' : 'gsc'}-${slugifyKeyword(query)}`;
  const title =
    opportunity.type === 'area' && opportunity.area
      ? `${opportunity.area.label}デリヘル｜${query}【${year}】`
      : `${query}｜アイドル学園ガイド【${year}】`;
  const description = `${query}について、アイドル学園（船橋）のエリア案内・予約のポイントを解説します。`;
  const guideSlug = slug.slice(0, 60);
  const canonical = `${SITE_URL}${BLOG}/${guideSlug}`;
  const outline = buildOutline(opportunity);

  let body = null;
  let usedLlm = false;
  let llmProvider = null;
  try {
    const llm = await generateArticleBody({
      title,
      query,
      outline,
      cta: CTA,
      castAgePolicy: AGE,
    });
    if (llm?.text) {
      body = llm.text;
      usedLlm = true;
      llmProvider = llm.provider;
    }
  } catch (err) {
    console.warn('LLM本文スキップ:', err.message);
  }
  if (!body) body = buildTemplateBody({ title, query, outline });

  const fileBase = `${String(articleNumber).padStart(3, '0')}-${slug}`;
  const fileName = `${fileBase}.md`;
  const badge = opportunity.area?.label || 'ガイド';

  let thumbPublicPath = null;
  if (execute) {
    const thumb = await generateArticleThumbnailPng({
      fileBase,
      title: title.replace(/【\d+】$/, '').replace(/｜.*/, ''),
      badge,
    });
    thumbPublicPath = thumb.publicPath;
  }

  const markdown = `# ${title}

## SEOメタ情報

- **title**: ${title}
- **description**: ${description}
- **canonical**: ${canonical}
- **og_image**: ${thumbPublicPath || `/images/articles/${fileBase}.png`}
- **記事タイプ**: 自動下書き（非公開・要ファクトチェック）
- **target_query**: ${query}
- **opportunity_type**: ${opportunity.type}
- **priority**: ${opportunity.priority || 'medium'}
- **著者**: アイドル学園 編集部
- **更新日**: ${isoDate()}
- **source**: ${source}
- **fact_check**: pending（年齢表現・エリア・料金表記を人手確認）
- **distribution**: no_auto_x
${opportunity.area ? `- **対応エリア**: ${opportunity.area.label}\n` : ''}
---

## ファクトチェック必須（公開前）

- [ ] 在籍年齢表現がポリシー（${AGE}）と一致するか
- [ ] JK・制服がコスプレコンセプトとして誤解なく書かれているか
- [ ] 料金・交通費の断定が現行案内と矛盾しないか
- [ ] 予約導線（電話・WEB）が正しいか
- [ ] allowlist 追加後のみ公開

---

## 本文

${body}
`;

  if (execute) {
    fs.mkdirSync(ARTICLES_DIR, { recursive: true });
    fs.writeFileSync(path.join(ARTICLES_DIR, fileName), markdown, 'utf8');
  }

  return {
    skipped: false,
    file: fileName,
    fileBase,
    query,
    title,
    type: opportunity.type,
    priority: opportunity.priority || 'medium',
    usedLlm,
    llmProvider,
    thumbPublicPath,
    publishHint: `GUIDE_ARTICLES に '${guideSlug}' → '${fileBase}' を追加`,
  };
}
