'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { setTranslationGetter } from '@/lib/utils'
import type { SupportedLocale, LocaleConfig } from './config'
import { DEFAULT_LOCALE, isValidLocale, locales } from './config'
import type { I18nContextType, TranslationMessages, TranslationParams } from './types'

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const STORAGE_KEY = 'locale'

/**
 * Get locale from localStorage
 */
function getStoredLocale(): SupportedLocale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && isValidLocale(stored)) {
      return stored
    }
  } catch (error) {
    // localStorage not available or blocked
    console.warn('Failed to read locale from localStorage:', error)
  }

  return DEFAULT_LOCALE
}

/**
 * Save locale to localStorage
 */
function saveLocale(locale: SupportedLocale): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch (error) {
    console.warn('Failed to save locale to localStorage:', error)
  }
}

/**
 * Load translation messages for a locale
 */
async function loadMessages(locale: SupportedLocale): Promise<TranslationMessages> {
  try {
    const messages = await import(`@/messages/${locale}.json`)
    return messages.default
  } catch (error) {
    console.error(`Failed to load translations for locale ${locale}:`, error)
    // Fallback to default locale
    if (locale !== DEFAULT_LOCALE) {
      const defaultMessages = await import(`@/messages/${DEFAULT_LOCALE}.json`)
      return defaultMessages.default
    }
    return {}
  }
}

/**
 * Get nested value from object by dot-notation key
 */
function getNestedValue(obj: any, key: string): string | undefined {
  const keys = key.split('.')
  let value: any = obj

  for (const k of keys) {
    if (value == null || typeof value !== 'object') {
      return undefined
    }
    value = value[k]
  }

  return typeof value === 'string' ? value : undefined
}

/**
 * Interpolate parameters into translation string
 */
function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template

  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = params[key]
    return value != null ? String(value) : ''
  })
}

interface I18nProviderProps {
  children: React.ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<SupportedLocale>(DEFAULT_LOCALE)
  const [messages, setMessages] = useState<TranslationMessages>({})
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Initialize locale from localStorage on mount
  useEffect(() => {
    const storedLocale = getStoredLocale()
    setLocaleState(storedLocale)
    setMounted(true)
  }, [])

  // Load messages when locale changes
  useEffect(() => {
    if (!mounted) return

    setIsLoading(true)
    loadMessages(locale)
      .then((loadedMessages) => {
        setMessages(loadedMessages)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Failed to load messages:', error)
        setIsLoading(false)
      })
  }, [locale, mounted])

  // Translation function
  const t = useCallback(
    (key: string, params?: TranslationParams): string => {
      const translation = getNestedValue(messages, key)

      if (!translation) {
        // Fallback: return key in development, empty string in production
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Translation missing for key: ${key}`)
          return key
        }
        return key
      }

      return interpolate(translation, params)
    },
    [messages]
  )

  // Register translation getter for utils
  useEffect(() => {
    setTranslationGetter(() => t)
  }, [t])

  // Set locale function
  const setLocale = useCallback((newLocale: SupportedLocale) => {
    if (!isValidLocale(newLocale)) {
      console.warn(`Invalid locale: ${newLocale}, falling back to ${DEFAULT_LOCALE}`)
      setLocaleState(DEFAULT_LOCALE)
      saveLocale(DEFAULT_LOCALE)
      return
    }

    setLocaleState(newLocale)
    saveLocale(newLocale)
  }, [])

  // Don't render children until mounted (prevents hydration mismatch)
  if (!mounted) {
    return <>{children}</>
  }

  const value: I18nContextType = {
    t,
    locale,
    setLocale,
    locales,
    isLoading,
    messages,
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

/**
 * Hook to use i18n context
 */
export function useI18n(): I18nContextType {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
