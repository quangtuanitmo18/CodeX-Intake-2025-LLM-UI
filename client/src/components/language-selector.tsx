'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useI18n } from '@/i18n/provider'
import { cn } from '@/lib/utils'
import { Globe } from 'lucide-react'

export function LanguageSelector() {
  const { locale, setLocale, locales } = useI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-9 w-9 rounded-md p-0',
            'transition-colors hover:bg-accent',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
          )}
          aria-label={`Select language, current: ${locales.find((l) => l.code === locale)?.name || locale}`}
          aria-haspopup="true"
        >
          <Globe className="h-5 w-5 text-foreground/80" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px]">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc.code}
            onClick={() => setLocale(loc.code)}
            className={cn(
              'flex cursor-pointer items-center gap-2',
              locale === loc.code && 'bg-accent'
            )}
            aria-selected={locale === loc.code}
          >
            {loc.flag && <span className="text-base">{loc.flag}</span>}
            <span>{loc.name}</span>
            {locale === loc.code && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
