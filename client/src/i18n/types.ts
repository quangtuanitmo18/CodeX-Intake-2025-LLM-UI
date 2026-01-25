/**
 * i18n Type Definitions
 */

import type { SupportedLocale, LocaleConfig } from './config'

/**
 * Translation function parameters
 */
export interface TranslationParams {
  [key: string]: string | number
}

/**
 * Translation hook return type
 */
export interface UseTranslationReturn {
  t: (key: string, params?: TranslationParams) => string
  locale: SupportedLocale
  setLocale: (locale: SupportedLocale) => void
  locales: LocaleConfig[]
  isLoading: boolean
}

/**
 * I18n context type
 */
export interface I18nContextType extends UseTranslationReturn {
  messages: Record<string, any>
}

/**
 * Translation file structure type
 */
export type TranslationMessages = Record<string, any>
