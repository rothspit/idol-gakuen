/**
 * 公開記事カタログ
 * content/articles/*.md はすべて公開対象（下書きゲートなし）
 */

import fs from 'fs'
import path from 'path'

const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articles')

function slugFromFile(baseName) {
  return baseName.replace(/^\d+-/, '')
}

function titleFromFile(baseName) {
  return baseName.replace(/^\d+-/, '').replace(/-/g, ' ')
}

export function loadAllArticleEntries() {
  const entries = []
  if (!fs.existsSync(ARTICLES_DIR)) return entries
  for (const file of fs.readdirSync(ARTICLES_DIR).sort()) {
    if (!file.endsWith('.md') || file === 'README.md') continue
    const base = file.replace(/\.md$/, '')
    const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf8')
    const titleMatch = raw.match(/\*\*title\*\*:\s*(.+)/)
    const seriesMatch = raw.match(/\*\*series\*\*:\s*(.+)/)
    const canonicalMatch = raw.match(/\*\*canonical\*\*:\s*(.+)/)
    let slug = slugFromFile(base)
    if (canonicalMatch) {
      const m = canonicalMatch[1].trim().match(/\/blog\/([^/?#]+)/)
      if (m) slug = decodeURIComponent(m[1])
    }
    entries.push({
      slug,
      file: base,
      title: titleMatch ? titleMatch[1].trim() : titleFromFile(base),
      series: seriesMatch ? seriesMatch[1].trim() : null,
    })
  }
  return entries
}

export const GUIDE_ARTICLES = Object.fromEntries(
  loadAllArticleEntries().map((e) => [e.slug, e]),
)

export function getGuideSlugs() {
  return Object.keys(GUIDE_ARTICLES)
}

export function getGuideEntry(slug) {
  return GUIDE_ARTICLES[slug] || null
}

export function listSeriesArticles(series) {
  return Object.entries(GUIDE_ARTICLES)
    .filter(([, v]) => v.series === series)
    .map(([slug, v]) => ({ slug, ...v }))
}
