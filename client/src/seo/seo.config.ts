import envConfig from '@/config'
import { Locale, LocalizedField, ResolvedSeoEntry, SeoEntry, SeoSlug } from './types'

const DEFAULT_LOCALE: Locale = 'en'

export const DEFAULT_SITE_URL =
  envConfig.NEXT_PUBLIC_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL

const seoEntries: Record<SeoSlug, SeoEntry> = {
  home: {
    slug: 'home',
    route: '/',
    title: {
      en: 'CodeX · LLM UI',
      vi: 'CodeX · LLM UI',
      ru: 'CodeX · LLM UI',
    },
    description: {
      en: 'Discover the CodeX LLM UI demo, collaborate with motivated builders, and explore cutting-edge open-source tooling for large language models.',
      vi: 'Khám phá bản demo CodeX LLM UI, cộng tác cùng đội ngũ đam mê và xây dựng sản phẩm AI mã nguồn mở.',
      ru: 'CodeX — небольшая команда энтузиастов, создающих open-source продукты и интерфейсы для работы с LLM.',
    },
    canonicalPath: '/',
    ogImage: {
      url: '/og/home',
      width: 1200,
      height: 630,
      alt: 'CodeX LLM UI hero preview',
    },
    twitterCard: 'summary_large_image',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'CodeX',
      url: DEFAULT_SITE_URL,
      description:
        'A motivated collective building open-source LLM interfaces and tooling for modern teams.',
      sameAs: ['https://codex.so'],
    },
    sitemap: {
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  },
  login: {
    slug: 'login',
    route: '/login',
    title: {
      en: 'Login · CodeX LLM UI',
      vi: 'Đăng nhập · CodeX LLM UI',
      ru: 'Вход · CodeX LLM UI',
    },
    description: {
      en: 'Access the CodeX LLM UI playground with demo credentials and continue your evaluation.',
      vi: 'Đăng nhập để sử dụng playground LLM UI của CodeX với thông tin demo.',
      ru: 'Войдите в CodeX LLM UI, чтобы продолжить работу с демонстрационным интерфейсом.',
    },
    canonicalPath: '/login',
    noindex: true,
    robots: {
      index: false,
      follow: false,
    },
    ogImage: {
      url: '/og/login',
      width: 1200,
      height: 630,
      alt: 'Login screen preview',
    },
    twitterCard: 'summary_large_image',
  },
  llm: {
    slug: 'llm',
    route: '/llm',
    title: {
      en: 'LLM Workspace · CodeX',
      vi: 'Không gian làm việc LLM · CodeX',
      ru: 'LLM Workspace · CodeX',
    },
    description: {
      en: 'Chat with models, inspect reasoning traces, and manage conversations in a responsive UI.',
      vi: 'Trò chuyện với mô hình, xem reasoning và quản lý hội thoại trong giao diện responsive.',
      ru: 'Ведите диалоги с LLM, просматривайте reasoning и управляйте историями общения в одном интерфейсе.',
    },
    canonicalPath: '/llm',
    ogImage: {
      url: '/og/llm',
      width: 1200,
      height: 630,
      alt: 'LLM conversation preview',
    },
    twitterCard: 'summary_large_image',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'CodeX LLM UI',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
    sitemap: {
      changeFrequency: 'daily',
      priority: 0.8,
    },
  },
  'llm-conversation': {
    slug: 'llm-conversation',
    route: '/llm/conversation/[conversationId]',
    title: {
      en: 'Conversation detail · CodeX LLM UI',
    },
    description: {
      en: 'Inspect individual LLM transcripts, reasoning steps, and attachments.',
    },
    canonicalPath: '/llm',
    noindex: true,
    ogImage: {
      url: '/og/llm',
      width: 1200,
      height: 630,
      alt: 'LLM conversation detail preview',
    },
    twitterCard: 'summary_large_image',
  },
  'llm-project': {
    slug: 'llm-project',
    route: '/llm/project/[projectId]',
    title: {
      en: 'Project conversations · CodeX LLM UI',
    },
    description: {
      en: 'Browse project-scoped chat history and manage shared prompts.',
    },
    canonicalPath: '/llm',
    noindex: true,
    ogImage: {
      url: '/og/llm',
      width: 1200,
      height: 630,
      alt: 'Project workspace preview',
    },
    twitterCard: 'summary_large_image',
  },
  profile: {
    slug: 'profile',
    route: '/profile',
    title: {
      en: 'Profile settings · CodeX LLM UI',
      vi: 'Hồ sơ cá nhân · CodeX LLM UI',
    },
    description: {
      en: 'Update your CodeX LLM UI profile, contact info, and workspace preferences.',
      vi: 'Cập nhật hồ sơ, thông tin liên hệ và tùy chỉnh workspace của bạn trong CodeX LLM UI.',
    },
    canonicalPath: '/profile',
    noindex: true,
    robots: {
      index: false,
      follow: false,
    },
    ogImage: {
      url: '/og/profile',
      width: 1200,
      height: 630,
      alt: 'Profile settings preview',
    },
    twitterCard: 'summary',
  },
  settings: {
    slug: 'settings',
    route: '/settings',
    title: {
      en: 'Workspace settings · CodeX LLM UI',
      vi: 'Cài đặt workspace · CodeX LLM UI',
    },
    description: {
      en: 'Manage notifications, API keys, and workspace preferences inside CodeX LLM UI.',
      vi: 'Quản lý thông báo, API key và thiết lập workspace trong CodeX LLM UI.',
    },
    canonicalPath: '/settings',
    noindex: true,
    robots: {
      index: false,
      follow: false,
    },
    ogImage: {
      url: '/og/settings',
      width: 1200,
      height: 630,
      alt: 'Settings preview',
    },
    twitterCard: 'summary',
  },
}

const pickLocalized = (field: LocalizedField, locale: Locale): string =>
  field[locale] ?? field[DEFAULT_LOCALE] ?? ''

const buildCanonicalUrl = (path: string, baseUrl: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  try {
    return new URL(normalizedPath, baseUrl).toString()
  } catch {
    return `${baseUrl}${normalizedPath}`
  }
}

export interface GetSeoEntryOptions {
  locale?: Locale
  siteUrl?: string
}

export function getSeoEntry(slug: SeoSlug, options: GetSeoEntryOptions = {}): ResolvedSeoEntry {
  const entry = seoEntries[slug]
  if (!entry) {
    throw new Error(`Unknown SEO entry slug: ${slug}`)
  }

  const locale = options.locale ?? DEFAULT_LOCALE
  const siteUrl = options.siteUrl ?? DEFAULT_SITE_URL

  return {
    slug: entry.slug,
    route: entry.route,
    title: pickLocalized(entry.title, locale),
    description: pickLocalized(entry.description, locale),
    canonicalUrl: buildCanonicalUrl(entry.canonicalPath, siteUrl),
    noindex: entry.noindex ?? false,
    robots: {
      index: entry.robots?.index ?? (entry.noindex === true ? false : true),
      follow: entry.robots?.follow ?? (entry.noindex === true ? false : true),
    },
    alternates: entry.alternates,
    ogImage: entry.ogImage,
    twitterCard: entry.twitterCard ?? 'summary',
    schema: entry.schema,
    sitemap: entry.sitemap,
  }
}

export function listSeoEntries(options: GetSeoEntryOptions = {}): ResolvedSeoEntry[] {
  return (Object.keys(seoEntries) as SeoSlug[]).map((slug) => getSeoEntry(slug, options))
}
