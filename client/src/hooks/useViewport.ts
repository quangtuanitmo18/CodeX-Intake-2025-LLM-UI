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
 * Uses ResizeObserver for better performance than window resize events
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
  // Always start with the SSR-safe defaults so the server and client markup match.
  const [viewportState, setViewportState] = useState<ViewportState>(defaultViewportState)

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') {
      return
    }

    // Set initial state after mount to avoid hydration mismatches
    setViewportState(getViewportState())

    // Use ResizeObserver for better performance than window resize events
    // ResizeObserver is more efficient and only fires when actual size changes
    let rafId: number | null = null
    const resizeObserver = new ResizeObserver(() => {
      // Throttle updates using requestAnimationFrame
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
      rafId = requestAnimationFrame(() => {
        setViewportState(getViewportState())
        rafId = null
      })
    })

    // Observe the document body for size changes
    resizeObserver.observe(document.body)

    // Fallback to window resize for older browsers (though ResizeObserver is widely supported)
    const handleResize = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
      rafId = requestAnimationFrame(() => {
        setViewportState(getViewportState())
        rafId = null
      })
    }

    window.addEventListener('resize', handleResize, { passive: true })

    // Cleanup
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleResize)
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [])

  return viewportState
}
