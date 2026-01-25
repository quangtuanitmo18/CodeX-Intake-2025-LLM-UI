/**
 * i18n Configuration
 * Defines supported locales and default language
 */

export type SupportedLocale = 'vi' | 'en' | 'ru'

export const DEFAULT_LOCALE: SupportedLocale = 'en'

export interface LocaleConfig {
  code: SupportedLocale
  name: string // Display name in native language
  flag?: string // Optional flag emoji or icon
}

export const locales: LocaleConfig[] = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
]

/**
 * Validate if a string is a valid locale
 */
export function isValidLocale(locale: string): locale is SupportedLocale {
  return locales.some((l) => l.code === locale)
}

/**
 * Get locale config by code
 */
export function getLocaleConfig(code: SupportedLocale): LocaleConfig {
  return locales.find((l) => l.code === code) || locales.find((l) => l.code === DEFAULT_LOCALE)!
}
