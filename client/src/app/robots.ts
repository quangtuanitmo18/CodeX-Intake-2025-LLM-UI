import type { MetadataRoute } from 'next'

import { DEFAULT_SITE_URL } from '@/seo/seo.config'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = DEFAULT_SITE_URL

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: `${siteUrl.replace(/\/$/, '')}/sitemap.xml`,
    host: siteUrl,
  }
}
