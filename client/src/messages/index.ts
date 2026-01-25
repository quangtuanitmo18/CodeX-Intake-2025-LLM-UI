/**
 * Translation Messages Index
 * Exports all translation files for type generation
 */

import en from './en.json'
import vi from './vi.json'
import ru from './ru.json'

export { en, vi, ru }

export type TranslationKey =
  | `common.${keyof typeof en.common}`
  | `auth.login.${keyof typeof en.auth.login}`
  | `auth.logout.${keyof typeof en.auth.logout}`
  | `errors.${keyof typeof en.errors}`
  | `toast.${keyof typeof en.toast}`
