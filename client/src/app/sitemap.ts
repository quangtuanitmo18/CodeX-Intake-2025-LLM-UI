import type { MetadataRoute } from 'next'

import { DEFAULT_SITE_URL, listSeoEntries } from '@/seo/seo.config'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = DEFAULT_SITE_URL
  const todayIso = new Date().toISOString()

  return listSeoEntries()
    .filter((entry) => !entry.noindex)
    .map((entry) => ({
      url: entry.canonicalUrl,
      lastModified: entry.sitemap?.lastModified ?? todayIso,
      changeFrequency: entry.sitemap?.changeFrequency,
      priority: entry.sitemap?.priority,
    }))
}
