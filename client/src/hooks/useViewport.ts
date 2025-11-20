'use client'

import { useEffect, useState } from 'react'

/**
 * Viewport state interface
 */
export interface ViewportState {
  /** Current viewport width in pixels */
  width: number
  /** Current viewport height in pixels */
  height: number
  /** Device orientation */
  orientation: 'portrait' | 'landscape'
  /** True if viewport width is less than 768px (mobile) */
  isMobile: boolean
  /** True if viewport width is between 768px and 1023px (tablet) */
  isTablet: boolean
  /** True if viewport width is 1024px or greater (desktop) */
  isDesktop: boolean
}

/**
 * Default viewport state for SSR (server-side rendering)
 */
const defaultViewportState: ViewportState = {
  width: 1024, // Default to desktop width for SSR
  height: 768,
  orientation: 'landscape',
  isMobile: false,
  isTablet: false,
  isDesktop: true,
}

/**
 * Debounce utility function
 */
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Get viewport dimensions and device type
 */
function getViewportState(): ViewportState {
  if (typeof window === 'undefined') {
    return defaultViewportState
  }

  const width = window.innerWidth
  const height = window.innerHeight
  const orientation = width > height ? 'landscape' : 'portrait'

  return {
    width,
    height,
    orientation,
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
  }
}

/**
 * React hook to detect viewport size and device type
 *
 * @returns ViewportState object with width, height, orientation, and device type flags
 *
 * @example
 * ```tsx
 * const { isMobile, isTablet, isDesktop, width } = useViewport()
 *
 * if (isMobile) {
 *   return <MobileLayout />
 * }
 * ```
 */
export function useViewport(): ViewportState {
  const [viewportState, setViewportState] = useState<ViewportState>(() => {
    // Initialize with current viewport state (or default for SSR)
    return getViewportState()
  })

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') {
      return
    }

    // Set initial state
    setViewportState(getViewportState())

    // Debounced resize handler (150ms delay)
    const handleResize = debounce(() => {
      setViewportState(getViewportState())
    }, 150)

    // Add event listener
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return viewportState
}
