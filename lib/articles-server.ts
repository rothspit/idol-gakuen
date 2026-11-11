import fs from 'fs'
import path from 'path'
import { marked } from 'marked'
import {
  GUIDE_ARTICLES,
  getGuideSlugs,
  loadAllArticleEntries,
} from '@/lib/articles'

const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articles')

marked.setOptions({ gfm: true, breaks: false })

function readArticleFile(baseName: string) {
  const filePath = path.join(ARTICLES_DIR, `${baseName}.md`)
  if (!fs.existsSync(filePath)) return null
  return fs.readFileSync(filePath, 'utf8')
}

function parseSeoBlock(raw: string) {
  const seo = {
    title: null as string | null,
    description: null as string | null,
    canonical: null as string | null,
    updatedAt: null as string | null,
    publishedAt: null as string | null,
    author: null as string | null,
    ogImage: null as string | null,
  }
  const grab = (re: RegExp) => {
    const m = raw.match(re)
    return m ? m[1].trim() : null
  }
  seo.title = grab(/\*\*title\*\*:\s*(.+)/)
  seo.description = grab(/\*\*description\*\*:\s*(.+)/)
  seo.canonical = grab(/\*\*canonical\*\*:\s*(.+)/)
  seo.updatedAt = grab(/\*\*(?:更新日|updated)\*\*:\s*(.+)/i)
  seo.publishedAt = grab(/\*\*(?:公開日|published)\*\*:\s*(.+)/i)
  seo.author = grab(/\*\*(?:著者|author)\*\*:\s*(.+)/i)
  seo.ogImage = grab(/\*\*(?:og_image|サムネ|thumbnail)\*\*:\s*(.+)/i)
  return seo
}

function extractBodyMarkdown(raw: string) {
  const marker = '## 本文'
  const index = raw.indexOf(marker)
  if (index === -1) return raw
  return raw.slice(index + marker.length).trim()
}

export function loadArticleByBaseName(baseName: string) {
  const raw = readArticleFile(baseName)
  if (!raw) return null
  const filePath = path.join(ARTICLES_DIR, `${baseName}.md`)
  const mtime = fs.statSync(filePath).mtime.toISOString().slice(0, 10)
  const seoPart = raw.split('## 本文')[0] || raw
  const bodyMarkdown = extractBodyMarkdown(raw)
  const seo = parseSeoBlock(seoPart)
  return {
    baseName,
    seo,
    bodyMarkdown,
    html: marked.parse(bodyMarkdown) as string,
    updatedAt: seo.updatedAt || mtime,
    publishedAt: seo.publishedAt || null,
  }
}

export function loadGuideArticle(slug: string) {
  const entries = loadAllArticleEntries()
  const entry = entries.find((e) => e.slug === slug) || GUIDE_ARTICLES[slug]
  if (!entry) return null
  const article = loadArticleByBaseName(entry.file)
  if (!article) return null
  return { ...entry, ...article, slug }
}

export function listGuideArticles() {
  return loadAllArticleEntries().map((meta) => {
    const article = loadArticleByBaseName(meta.file)
    return {
      slug: meta.slug,
      href: `/blog/${meta.slug}`,
      title: article?.seo?.title || meta.title,
      description: article?.seo?.description || '',
      series: meta.series || null,
    }
  })
}

export function getGuideSlugsLive() {
  return loadAllArticleEntries().map((e) => e.slug)
}

export { getGuideSlugs }
