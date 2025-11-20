import ProfilePage from '@/pageSections/profile/profile-page'
import { buildPageMetadata } from '@/seo/next-metadata'

export const metadata = buildPageMetadata('profile')

export default function Profile() {
  return <ProfilePage />
}
