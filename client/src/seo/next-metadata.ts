import type { Metadata } from 'next'

import { DEFAULT_SITE_URL, getSeoEntry, type GetSeoEntryOptions } from './seo.config'
import type { Locale, SeoSlug } from './types'

const toAbsoluteUrl = (inputUrl: string | undefined, baseUrl: string): string | undefined => {
  if (!inputUrl) return undefined
  if (inputUrl.startsWith('http://') || inputUrl.startsWith('https://')) {
    return inputUrl
  }

  try {
    return new URL(inputUrl, baseUrl).toString()
  } catch {
    return inputUrl
  }
}

const buildMetadataBase = (siteUrl: string): URL | undefined => {
  try {
    return new URL(siteUrl)
  } catch {
    return undefined
  }
}

export interface BuildMetadataOptions extends GetSeoEntryOptions {
  locale?: Locale
}

export function buildPageMetadata(slug: SeoSlug, options: BuildMetadataOptions = {}): Metadata {
  const siteUrl = options.siteUrl ?? DEFAULT_SITE_URL
  const entry = getSeoEntry(slug, { ...options, siteUrl })
  const metadataBase = buildMetadataBase(siteUrl)
  const ogImageUrl = entry.ogImage ? toAbsoluteUrl(entry.ogImage.url, siteUrl) : undefined

  const metadata: Metadata = {
    title: entry.title,
    description: entry.description,
    metadataBase,
    alternates: {
      canonical: entry.canonicalUrl,
      languages: entry.alternates?.languages,
    },
    robots: {
      index: entry.robots.index,
      follow: entry.robots.follow,
    },
    openGraph: {
      title: entry.title,
      description: entry.description,
      type: 'website',
      url: entry.canonicalUrl,
      images: ogImageUrl
        ? [
            {
              url: ogImageUrl,
              width: entry.ogImage?.width,
              height: entry.ogImage?.height,
              alt: entry.ogImage?.alt,
            },
          ]
        : undefined,
    },
    twitter: {
      card: entry.twitterCard,
      title: entry.title,
      description: entry.description,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
  }

  if (entry.schema) {
    metadata.other = metadata.other ?? {}
    metadata.other['script:ld+json'] = JSON.stringify(entry.schema)
  }

  return metadata
}
