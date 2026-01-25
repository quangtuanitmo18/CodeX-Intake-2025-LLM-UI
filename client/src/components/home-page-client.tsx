'use client'

import Image from 'next/image'
import Link from 'next/link'

import { LanguageSelector } from '@/components/language-selector'
import { ThemeToggleWrapper } from '@/components/theme-toggle-wrapper'
import { useTranslation } from '@/hooks/use-translation'

export function HomePageClient() {
  const { t } = useTranslation()

  return (
    <main id="main-content" className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-16">
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <LanguageSelector />
        <ThemeToggleWrapper />
      </div>
      <header className="flex flex-col items-center gap-5 text-center">
        <Image
          src="/codex-logo.svg"
          alt="CodeX logo"
          width={180}
          height={180}
          priority
          className="h-auto w-32 drop-shadow-lg sm:w-44"
        />

        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
          {t('home.description')}
        </p>
        <Link
          href="/login"
          className="rounded-2xl bg-primary px-10 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
        >
          {t('home.loginButton')}
        </Link>
      </header>

      <section className="space-y-5 rounded-3xl border border-border bg-card p-6 text-base leading-relaxed text-card-foreground shadow-inner backdrop-blur lg:p-8">
        <p>{t('home.section1')}</p>
        <p>{t('home.section2')}</p>
        <br />
        <hr className="border-border" />
        <br />
        <p>{t('home.section3')}</p>
        <p>{t('home.section4')}</p>
      </section>
    </main>
  )
}
