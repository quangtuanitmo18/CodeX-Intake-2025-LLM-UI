'use client'

import type { Language } from '@/hooks/useSpeechToText'
import { checkBrowserSupport, useSpeechToText } from '@/hooks/useSpeechToText'
import { ChevronDown, Loader2, Mic, MicOff } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Русский' },
  { value: 'multi', label: 'Multi' },
]

interface MicrophoneButtonProps {
  language: Language
  onLanguageChange?: (language: Language) => void
  onTranscriptChange?: (transcript: string) => void
  disabled?: boolean
}

export function MicrophoneButton({
  language: initialLanguage,
  onLanguageChange,
  onTranscriptChange,
  disabled,
}: MicrophoneButtonProps) {
  const [language, setLanguage] = useState<Language>(initialLanguage)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { isRecording, isConnecting, fullTranscript, error, start, stop } =
    useSpeechToText(language)

  // Initialize with default values to avoid SSR issues
  const [browserSupport, setBrowserSupport] = useState<{
    supported: boolean
    missingFeatures: string[]
  }>({ supported: true, missingFeatures: [] })

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('speech-language')
      if (saved && LANGUAGE_OPTIONS.some((opt) => opt.value === saved)) {
        const savedLanguage = saved as Language
        setLanguage(savedLanguage)
        onLanguageChange?.(savedLanguage)
      }
    }
  }, [onLanguageChange])

  // Check browser support on mount (only on client-side)
  useEffect(() => {
    // Only check on client-side
    if (typeof window !== 'undefined') {
      setBrowserSupport(checkBrowserSupport())
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isDropdownOpen])

  // Notify parent of transcript changes
  useEffect(() => {
    if (onTranscriptChange && fullTranscript) {
      onTranscriptChange(fullTranscript)
    }
  }, [fullTranscript, onTranscriptChange])

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    onLanguageChange?.(newLanguage)
    localStorage.setItem('speech-language', newLanguage)
    setIsDropdownOpen(false)
  }

  const handleMicClick = () => {
    if (isRecording) {
      stop()
    } else {
      start()
    }
  }

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isRecording && !isConnecting) {
      setIsDropdownOpen(!isDropdownOpen)
    }
  }

  const isDisabled = disabled || isConnecting || !!error || !browserSupport.supported

  // Show browser compatibility error (only on client-side)
  const displayError =
    error ||
    (typeof window !== 'undefined' &&
    !browserSupport.supported &&
    browserSupport.missingFeatures.length > 0
      ? `Browser không hỗ trợ: ${browserSupport.missingFeatures.join(', ')}`
      : null)

  const selectedOption =
    LANGUAGE_OPTIONS.find((opt) => opt.value === language) || LANGUAGE_OPTIONS[0]

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`flex items-center gap-0 overflow-hidden rounded-[16px] border border-[#191919] ${
          isRecording ? 'border-red-500/50 bg-red-500/20' : ''
        }`}
      >
        {/* Mic Button Part */}
        <button
          type="button"
          onClick={handleMicClick}
          disabled={isDisabled}
          className={`flex items-center justify-center gap-1 px-[11px] py-[3px] text-[14px] font-medium leading-[22px] transition-colors disabled:opacity-50 ${
            isRecording ? 'animate-pulse text-red-300' : 'text-[#777777] hover:bg-white/5'
          }`}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          title={
            !browserSupport.supported
              ? `Không hỗ trợ: ${browserSupport.missingFeatures.join(', ')}`
              : undefined
          }
        >
          {isConnecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isRecording ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
          <span className="md:inline">{isRecording ? 'Stop' : 'Mic'}</span>
        </button>

        {/* Language Dropdown Part */}
        <button
          type="button"
          onClick={handleDropdownToggle}
          disabled={isDisabled || isRecording || isConnecting}
          className="flex items-center justify-center gap-1 border-l border-[#191919] px-[8px] py-[3px] text-[14px] font-medium leading-[22px] text-[#777777] transition-colors hover:bg-white/5 active:bg-white/10 disabled:opacity-50"
          aria-label="Select language"
        >
          <span className="text-xs md:inline">{selectedOption.label}</span>
          <ChevronDown
            className={`h-3 w-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isDropdownOpen && !isRecording && !isConnecting && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
          <div className="absolute bottom-full left-0 z-20 mb-2 min-w-[140px] rounded-[12px] border border-[#191919] bg-[#0E0E0E] shadow-lg">
            {LANGUAGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleLanguageChange(option.value)}
                className={`w-full px-3 py-2 text-left text-[14px] transition-colors first:rounded-t-[12px] last:rounded-b-[12px] ${
                  language === option.value
                    ? 'bg-white/10 text-white'
                    : 'text-[#777777] hover:bg-white/5'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Error Message */}
      {displayError && (
        <div className="absolute bottom-full left-0 z-50 mb-2 max-w-xs whitespace-normal rounded-[12px] border border-red-500/50 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {displayError}
        </div>
      )}
    </div>
  )
}
