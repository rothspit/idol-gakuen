export type GuideArticleEntry = {
  file: string
  title: string
  series?: string | null
  slug: string
}

export declare function loadAllArticleEntries(): GuideArticleEntry[]
export declare const GUIDE_ARTICLES: Record<string, GuideArticleEntry>
export declare function getGuideSlugs(): string[]
export declare function getGuideEntry(slug: string): GuideArticleEntry | null
export declare function listSeriesArticles(
  series: string,
): Array<GuideArticleEntry & { slug: string }>
