'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/use-translation'
import { LanguageSelector } from '@/components/language-selector'
import { ThemeToggle } from '@/components/theme-toggle'

export default function SettingsPage() {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-3 md:py-4">
          <button
            onClick={() => router.back()}
            className="inline-flex min-h-[32px] items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground active:text-foreground/80 md:min-h-0"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('pages.settings.back')}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-6 md:py-8">
        <h1 className="mb-6 text-2xl font-bold md:mb-8 md:text-3xl">{t('pages.settings.title')}</h1>

        <div className="space-y-4 md:space-y-6">
          {/* General Settings */}
          <div className="rounded-lg border border-border bg-card p-4 md:p-6">
            <h2 className="mb-3 text-lg font-semibold md:mb-4 md:text-xl">
              {t('pages.settings.general.title')}
            </h2>
            <div className="space-y-3 md:space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium md:text-base">
                    {t('pages.settings.general.language')}
                  </p>
                  <p className="text-xs text-muted-foreground md:text-sm">
                    {t('pages.settings.general.languageDescription')}
                  </p>
                </div>
                <LanguageSelector />
              </div>

              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium md:text-base">
                    {t('pages.settings.general.theme')}
                  </p>
                  <p className="text-xs text-muted-foreground md:text-sm">
                    {t('pages.settings.general.themeDescription')}
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </div>

          {/* LLM Settings */}
          <div className="rounded-lg border border-border bg-card p-4 md:p-6">
            <h2 className="mb-3 text-lg font-semibold md:mb-4 md:text-xl">
              {t('pages.settings.llm.title')}
            </h2>
            <div className="space-y-3 md:space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium md:text-base">
                    {t('pages.settings.llm.defaultModel')}
                  </p>
                  <p className="text-xs text-muted-foreground md:text-sm">
                    {t('pages.settings.llm.defaultModelDescription')}
                  </p>
                </div>
                <select className="min-h-[32px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring md:w-auto md:px-4">
                  <option>GPT-4</option>
                  <option>GPT-3.5</option>
                  <option>Claude</option>
                </select>
              </div>

              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium md:text-base">
                    {t('pages.settings.llm.temperature')}
                  </p>
                  <p className="text-xs text-muted-foreground md:text-sm">
                    {t('pages.settings.llm.temperatureDescription')}
                  </p>
                </div>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  defaultValue="0.7"
                  className="min-h-[32px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring md:w-24 md:px-4"
                />
              </div>

              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium md:text-base">
                    {t('pages.settings.llm.maxTokens')}
                  </p>
                  <p className="text-xs text-muted-foreground md:text-sm">
                    {t('pages.settings.llm.maxTokensDescription')}
                  </p>
                </div>
                <input
                  type="number"
                  min="100"
                  max="4000"
                  step="100"
                  defaultValue="2000"
                  className="min-h-[32px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring md:w-24 md:px-4"
                />
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="rounded-lg border border-border bg-card p-4 md:p-6">
            <h2 className="mb-3 text-lg font-semibold md:mb-4 md:text-xl">
              {t('pages.settings.privacy.title')}
            </h2>
            <div className="space-y-3 md:space-y-4">
              <label className="flex min-h-[32px] items-center justify-between gap-4 md:min-h-0">
                <div className="flex-1">
                  <p className="text-sm font-medium md:text-base">
                    {t('pages.settings.privacy.saveConversationHistory')}
                  </p>
                  <p className="text-xs text-muted-foreground md:text-sm">
                    {t('pages.settings.privacy.saveConversationHistoryDescription')}
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-5 min-h-[32px] w-5 min-w-[44px] shrink-0 rounded border-border bg-background text-primary focus:ring-2 focus:ring-ring md:min-h-0 md:min-w-0"
                />
              </label>

              <label className="flex min-h-[32px] items-center justify-between gap-4 md:min-h-0">
                <div className="flex-1">
                  <p className="text-sm font-medium md:text-base">
                    {t('pages.settings.privacy.analytics')}
                  </p>
                  <p className="text-xs text-muted-foreground md:text-sm">
                    {t('pages.settings.privacy.analyticsDescription')}
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-5 min-h-[32px] w-5 min-w-[44px] shrink-0 rounded border-border bg-background text-primary focus:ring-2 focus:ring-ring md:min-h-0 md:min-w-0"
                />
              </label>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 md:p-6">
            <h2 className="mb-3 text-lg font-semibold text-destructive md:mb-4 md:text-xl">
              {t('pages.settings.dangerZone.title')}
            </h2>
            <div className="space-y-3 md:space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium md:text-base">
                    {t('pages.settings.dangerZone.deleteAllConversations')}
                  </p>
                  <p className="text-xs text-muted-foreground md:text-sm">
                    {t('pages.settings.dangerZone.deleteAllConversationsDescription')}
                  </p>
                </div>
                <button className="min-h-[32px] w-full rounded-lg border border-destructive bg-destructive/50 px-4 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/60 active:bg-destructive/70 md:min-h-0 md:w-auto">
                  {t('pages.settings.dangerZone.deleteAll')}
                </button>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium md:text-base">
                    {t('pages.settings.dangerZone.deleteAccount')}
                  </p>
                  <p className="text-xs text-muted-foreground md:text-sm">
                    {t('pages.settings.dangerZone.deleteAccountDescription')}
                  </p>
                </div>
                <button className="min-h-[32px] w-full rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition hover:bg-destructive/90 active:bg-destructive/80 md:min-h-0 md:w-auto">
                  {t('pages.settings.dangerZone.deleteAccountButton')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
