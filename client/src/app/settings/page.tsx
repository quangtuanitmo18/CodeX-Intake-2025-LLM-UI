import SettingsPage from '@/pageSections/settings/settings-page'
import { buildPageMetadata } from '@/seo/next-metadata'

export const metadata = buildPageMetadata('settings')

export default function Settings() {
  return <SettingsPage />
}
