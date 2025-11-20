import type { MetadataRoute } from 'next'

import { DEFAULT_SITE_URL, listSeoEntries } from '@/seo/seo.config'

const sanitizeDisallowPath = (route: string): string => {
  if (!route.startsWith('/')) {
    return `/${route}`
  }
  return route.replace(/\[.*?\]/g, '*').replace(/\/\*+/g, '/*')
}

export default function robots(): MetadataRoute.Robots {
  const siteUrl = DEFAULT_SITE_URL
  const disallow = listSeoEntries()
    .filter((entry) => !entry.robots.index)
    .map((entry) => sanitizeDisallowPath(entry.route))

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: disallow.length ? disallow : undefined,
      },
    ],
    sitemap: `${siteUrl.replace(/\/$/, '')}/sitemap.xml`,
    host: siteUrl,
  }
}
