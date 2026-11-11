/**
 * 記事サムネイル（OGサイズ 1200x630）を PNG で生成
 * アイドル学園: 明るいピンク + 白
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensurePngFile, toPngBuffer } from './to-png.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '../../..');
export const ARTICLE_IMAGE_DIR = path.join(ROOT, 'public', 'images', 'articles');

function escapeXml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapTitle(title, maxChars = 18) {
  const t = String(title || '').trim();
  if (t.length <= maxChars) return [t];
  const lines = [];
  let rest = t;
  while (rest.length > 0 && lines.length < 3) {
    if (rest.length <= maxChars) {
      lines.push(rest);
      break;
    }
    let cut = maxChars;
    const slice = rest.slice(0, maxChars + 4);
    const punct = Math.max(slice.lastIndexOf('｜'), slice.lastIndexOf('、'), slice.lastIndexOf(' '));
    if (punct >= Math.floor(maxChars * 0.5)) cut = punct + 1;
    lines.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest && lines.length === 3) {
    lines[2] = `${lines[2].slice(0, Math.max(0, maxChars - 1))}…`;
  }
  return lines;
}

export function buildThumbnailSvg({ title, eyebrow = 'IDOL GAKUEN', badge = null }) {
  const lines = wrapTitle(title, 20);
  const lineEls = lines
    .map((line, i) => {
      const y = 280 + i * 58;
      return `<text x="80" y="${y}" font-family="'Noto Sans CJK JP','Noto Sans JP','Hiragino Sans','Yu Gothic',sans-serif" font-size="44" font-weight="700" fill="#1C1917">${escapeXml(line)}</text>`;
    })
    .join('\n');

  const badgeEl = badge
    ? `<rect x="80" y="170" rx="6" ry="6" width="${Math.min(28 + badge.length * 18, 360)}" height="36" fill="#EC4899"/>
       <text x="96" y="195" font-family="'Noto Sans CJK JP','Noto Sans JP','Hiragino Sans',sans-serif" font-size="16" font-weight="700" fill="#FFF7FB">${escapeXml(badge)}</text>`
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF7FB"/>
      <stop offset="55%" stop-color="#FDF2F8"/>
      <stop offset="100%" stop-color="#FCE7F3"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1040" cy="90" r="160" fill="#EC4899" fill-opacity="0.08"/>
  <circle cx="160" cy="540" r="120" fill="#38BDF8" fill-opacity="0.08"/>
  <text x="80" y="120" font-family="'Noto Sans JP',sans-serif" font-size="18" font-weight="600" letter-spacing="0.18em" fill="#EC4899">${escapeXml(eyebrow)}</text>
  ${badgeEl}
  ${lineEls}
  <text x="80" y="560" font-family="'Noto Sans JP',sans-serif" font-size="22" font-weight="600" fill="#9D174D" fill-opacity="0.8">idolgakuen.jp</text>
  <rect x="80" y="580" width="120" height="4" rx="2" fill="#EC4899"/>
</svg>`;
}

export async function generateArticleThumbnailPng({
  fileBase,
  title,
  badge = null,
  sourceImagePath = null,
}) {
  fs.mkdirSync(ARTICLE_IMAGE_DIR, { recursive: true });
  const fileName = `${fileBase}.png`;
  const absolutePath = path.join(ARTICLE_IMAGE_DIR, fileName);
  const publicPath = `/images/articles/${fileName}`;

  if (sourceImagePath && fs.existsSync(sourceImagePath)) {
    await ensurePngFile(sourceImagePath, absolutePath, { width: 1200, height: 630, fit: 'cover' });
    return { absolutePath, publicPath };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey && process.env.SEO_THUMB_LLM === '1') {
    try {
      const pngFromLlm = await generateLlmThumbnailPng(title);
      if (pngFromLlm) {
        await ensurePngFile(pngFromLlm, absolutePath, { width: 1200, height: 630, fit: 'cover' });
        return { absolutePath, publicPath };
      }
    } catch (err) {
      console.warn('LLM サムネ失敗 → ブランドテンプレにフォールバック:', err.message);
    }
  }

  const svg = buildThumbnailSvg({ title, badge });
  const buf = await toPngBuffer(Buffer.from(svg), { width: 1200, height: 630, fit: 'fill' });
  fs.writeFileSync(absolutePath, buf);
  return { absolutePath, publicPath };
}

async function generateLlmThumbnailPng(title) {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
      prompt: `Professional, calm editorial thumbnail for a Japanese light-delivery driver recruitment site. Theme: "${title}". Navy and soft amber, trustworthy logistics atmosphere, no explicit content, no competitors' logos, no readable Japanese text in the image.`,
      size: '1536x1024',
    }),
  });
  if (!res.ok) {
    throw new Error(`images API ${res.status}`);
  }
  const data = await res.json();
  const b64 = data.data?.[0]?.b64_json;
  if (b64) return Buffer.from(b64, 'base64');
  const url = data.data?.[0]?.url;
  if (!url) return null;
  const imgRes = await fetch(url);
  return Buffer.from(await imgRes.arrayBuffer());
}
