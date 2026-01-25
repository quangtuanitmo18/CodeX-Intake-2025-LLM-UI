import { HomePageClient } from '@/components/home-page-client'
import { buildPageMetadata } from '@/seo/next-metadata'

export const metadata = buildPageMetadata('home')

export default function HomePage() {
  return <HomePageClient />
}
