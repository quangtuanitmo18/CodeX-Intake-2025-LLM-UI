export type Locale = 'en' | 'vi' | 'ru'

export type SeoSlug =
  | 'home'
  | 'login'
  | 'llm'
  | 'llm-conversation'
  | 'llm-project'
  | 'profile'
  | 'settings'

export interface LocalizedField {
  en: string
  vi?: string
  ru?: string
  [localeCode: string]: string | undefined
}

export interface OgImage {
  url: string
  width: number
  height: number
  alt: string
  type?: string
}

export interface SitemapConfig {
  changeFrequency?: 'daily' | 'weekly' | 'monthly'
  priority?: number
  lastModified?: string
}

export interface SeoEntry {
  slug: SeoSlug
  route: string
  title: LocalizedField
  description: LocalizedField
  canonicalPath: string
  noindex?: boolean
  robots?: {
    index?: boolean
    follow?: boolean
  }
  alternates?: {
    languages?: Record<string, string>
  }
  ogImage?: OgImage
  twitterCard?: 'summary' | 'summary_large_image'
  schema?: Record<string, unknown>
  sitemap?: SitemapConfig
}

export interface ResolvedSeoEntry {
  slug: SeoSlug
  route: string
  title: string
  description: string
  canonicalUrl: string
  noindex: boolean
  robots: {
    index: boolean
    follow: boolean
  }
  alternates?: {
    languages?: Record<string, string>
  }
  ogImage?: OgImage
  twitterCard: 'summary' | 'summary_large_image'
  schema?: Record<string, unknown>
  sitemap?: SitemapConfig
}
