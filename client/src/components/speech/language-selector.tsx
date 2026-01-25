'use client'

import { useEffect, useState } from 'react'

type Language = 'vi' | 'en' | 'ru' | 'multi'

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Русский' },
  { value: 'multi', label: 'Multi' },
]

interface LanguageSelectorProps {
  value: Language
  onChange: (language: Language) => void
  disabled?: boolean
}

export function LanguageSelector({ value, onChange, disabled }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('speech-language')
    if (saved && LANGUAGE_OPTIONS.some((opt) => opt.value === saved)) {
      onChange(saved as Language)
    }
  }, [onChange])

  // Save to localStorage on change
  const handleChange = (lang: Language) => {
    onChange(lang)
    localStorage.setItem('speech-language', lang)
    setIsOpen(false)
  }

  const selectedOption = LANGUAGE_OPTIONS.find((opt) => opt.value === value) || LANGUAGE_OPTIONS[0]

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center justify-center gap-1 rounded-[16px] border border-border px-[11px] py-[3px] text-[14px] font-medium leading-[22px] text-muted-foreground transition-colors hover:border-foreground/20 active:bg-accent disabled:opacity-50"
        aria-label="Select language"
      >
        <span className="md:inline">{selectedOption.label}</span>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full left-0 z-20 mb-2 min-w-[120px] rounded-[12px] border border-border bg-popover shadow-lg">
            {LANGUAGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange(option.value)}
                className={`w-full px-3 py-2 text-left text-[14px] transition-colors first:rounded-t-[12px] last:rounded-b-[12px] ${
                  value === option.value
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
