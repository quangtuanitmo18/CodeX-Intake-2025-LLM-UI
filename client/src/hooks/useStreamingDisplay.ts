import type { StreamStatus } from '@/queries/useLLMStream'
import { useCallback, useEffect, useRef, useState } from 'react'

type UseStreamingDisplayOptions = {
  chunkSize?: number
  minChunkSize?: number
  intervalMs?: number
  accelerateOnComplete?: boolean
}

const DEFAULT_OPTIONS: Required<UseStreamingDisplayOptions> = {
  chunkSize: 10,
  minChunkSize: 3,
  intervalMs: 90,
  accelerateOnComplete: true,
}

const getChunkLength = (buffer: string, chunkSize: number, minChunkSize: number) => {
  if (buffer.length <= chunkSize) {
    return buffer.length
  }

  const slice = buffer.slice(0, chunkSize + 5)
  const newlineIndex = slice.indexOf('\n')
  if (newlineIndex >= minChunkSize) {
    return newlineIndex + 1
  }

  const punctuationMatch = slice.match(/[.!?,]\s/)
  if (punctuationMatch?.index !== undefined) {
    const punctuationLength = punctuationMatch.index + punctuationMatch[0].length
    if (punctuationLength >= minChunkSize) {
      return punctuationLength
    }
  }

  const lastSpaceIndex = slice.lastIndexOf(' ')
  if (lastSpaceIndex >= minChunkSize) {
    return lastSpaceIndex + 1
  }

  return chunkSize
}

export function useStreamingDisplay(
  sourceText: string,
  status: StreamStatus,
  options?: UseStreamingDisplayOptions
) {
  const { chunkSize, minChunkSize, intervalMs, accelerateOnComplete } = {
    ...DEFAULT_OPTIONS,
    ...options,
  }

  const [displayText, setDisplayText] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)
  const pendingRef = useRef('')
  const visibleRef = useRef('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSourceRef = useRef('')

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startAnimation = useCallback(
    (flushFast = false) => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
      if (!pendingRef.current.length) {
        return
      }

      setIsAnimating(true)

      const step = () => {
        if (!pendingRef.current.length) {
          timerRef.current = null
          setIsAnimating(false)
          return
        }

        const baseSize = flushFast
          ? Math.max(chunkSize, Math.ceil(pendingRef.current.length / 2))
          : chunkSize
        const chunkLength = getChunkLength(pendingRef.current, baseSize, minChunkSize)
        const chunk = pendingRef.current.slice(0, chunkLength)
        pendingRef.current = pendingRef.current.slice(chunkLength)
        visibleRef.current += chunk
        setDisplayText(visibleRef.current)

        if (pendingRef.current.length) {
          const proportionalDelay = intervalMs * Math.max(0.4, chunkLength / (chunkSize || 1))
          const nextDelay = flushFast
            ? Math.max(18, intervalMs / 3)
            : Math.max(28, proportionalDelay)
          timerRef.current = setTimeout(step, nextDelay)
        } else {
          timerRef.current = null
          setIsAnimating(false)
        }
      }

      timerRef.current = setTimeout(step, flushFast ? 0 : intervalMs)
    },
    [chunkSize, intervalMs, minChunkSize]
  )

  // Track new incoming text and queue it for animation
  useEffect(() => {
    if (sourceText === lastSourceRef.current) {
      return
    }

    if (sourceText.length < lastSourceRef.current.length) {
      // Reset scenario (new stream)
      pendingRef.current = sourceText
      visibleRef.current = ''
      setDisplayText('')
      startAnimation()
    } else {
      pendingRef.current += sourceText.slice(lastSourceRef.current.length)
      if (timerRef.current === null) {
        startAnimation()
      }
    }

    lastSourceRef.current = sourceText
  }, [sourceText, startAnimation])

  // React to status changes (idle/error/complete)
  useEffect(() => {
    if (status === 'idle') {
      clearTimer()
      pendingRef.current = ''
      visibleRef.current = ''
      lastSourceRef.current = ''
      setDisplayText('')
      setIsAnimating(false)
      return
    }

    if ((status === 'complete' || status === 'error') && accelerateOnComplete) {
      if (pendingRef.current.length) {
        startAnimation(true)
      }
    }
  }, [status, accelerateOnComplete, clearTimer, startAnimation])

  useEffect(() => {
    return () => {
      clearTimer()
    }
  }, [clearTimer])

  return [displayText, isAnimating] as const
}
