'use client'

import { useEffect, useState } from 'react'

/**
 * Breakpoint state interface
 */
export interface BreakpointState {
  /** True if viewport is >= 640px (sm breakpoint) */
  isSm: boolean
  /** True if viewport is >= 768px (md breakpoint) */
  isMd: boolean
  /** True if viewport is >= 1024px (lg breakpoint) */
  isLg: boolean
  /** True if viewport is >= 1280px (xl breakpoint) */
  isXl: boolean
  /** True if viewport is >= 1920px (2xl breakpoint) */
  is2xl: boolean
}

/**
 * Tailwind CSS breakpoint values (matching tailwind.config.ts)
 */
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1920,
} as const

/**
 * Default breakpoint state for SSR (server-side rendering)
 * Assumes desktop viewport for SSR
 */
const defaultBreakpointState: BreakpointState = {
  isSm: true,
  isMd: true,
  isLg: true,
  isXl: false,
  is2xl: false,
}

/**
 * Get breakpoint state using window.matchMedia()
 */
function getBreakpointState(): BreakpointState {
  if (typeof window === 'undefined') {
    return defaultBreakpointState
  }

  return {
    isSm: window.matchMedia(`(min-width: ${BREAKPOINTS.sm}px)`).matches,
    isMd: window.matchMedia(`(min-width: ${BREAKPOINTS.md}px)`).matches,
    isLg: window.matchMedia(`(min-width: ${BREAKPOINTS.lg}px)`).matches,
    isXl: window.matchMedia(`(min-width: ${BREAKPOINTS.xl}px)`).matches,
    is2xl: window.matchMedia(`(min-width: ${BREAKPOINTS['2xl']}px)`).matches,
  }
}

/**
 * React hook to detect current Tailwind CSS breakpoints
 *
 * Uses `window.matchMedia()` to check breakpoint values matching Tailwind config.
 * Returns boolean flags for each breakpoint (sm, md, lg, xl, 2xl).
 *
 * @returns BreakpointState object with boolean flags for each breakpoint
 *
 * @example
 * ```tsx
 * const { isSm, isMd, isLg } = useBreakpoint()
 *
 * if (isLg) {
 *   return <DesktopLayout />
 * } else if (isMd) {
 *   return <TabletLayout />
 * } else {
 *   return <MobileLayout />
 * }
 * ```
 */
export function useBreakpoint(): BreakpointState {
  const [breakpointState, setBreakpointState] = useState<BreakpointState>(() => {
    // Initialize with current breakpoint state (or default for SSR)
    return getBreakpointState()
  })

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') {
      return
    }

    // Create MediaQueryList objects for each breakpoint
    const mediaQueries = {
      sm: window.matchMedia(`(min-width: ${BREAKPOINTS.sm}px)`),
      md: window.matchMedia(`(min-width: ${BREAKPOINTS.md}px)`),
      lg: window.matchMedia(`(min-width: ${BREAKPOINTS.lg}px)`),
      xl: window.matchMedia(`(min-width: ${BREAKPOINTS.xl}px)`),
      '2xl': window.matchMedia(`(min-width: ${BREAKPOINTS['2xl']}px)`),
    }

    // Handler to update breakpoint state
    const handleChange = () => {
      setBreakpointState({
        isSm: mediaQueries.sm.matches,
        isMd: mediaQueries.md.matches,
        isLg: mediaQueries.lg.matches,
        isXl: mediaQueries.xl.matches,
        is2xl: mediaQueries['2xl'].matches,
      })
    }

    // Set initial state
    handleChange()

    // Add event listeners (modern browsers support addEventListener on MediaQueryList)
    if (mediaQueries.sm.addEventListener) {
      mediaQueries.sm.addEventListener('change', handleChange)
      mediaQueries.md.addEventListener('change', handleChange)
      mediaQueries.lg.addEventListener('change', handleChange)
      mediaQueries.xl.addEventListener('change', handleChange)
      mediaQueries['2xl'].addEventListener('change', handleChange)
    } else {
      // Fallback for older browsers (use addListener)
      mediaQueries.sm.addListener(handleChange)
      mediaQueries.md.addListener(handleChange)
      mediaQueries.lg.addListener(handleChange)
      mediaQueries.xl.addListener(handleChange)
      mediaQueries['2xl'].addListener(handleChange)
    }

    // Cleanup
    return () => {
      if (mediaQueries.sm.removeEventListener) {
        mediaQueries.sm.removeEventListener('change', handleChange)
        mediaQueries.md.removeEventListener('change', handleChange)
        mediaQueries.lg.removeEventListener('change', handleChange)
        mediaQueries.xl.removeEventListener('change', handleChange)
        mediaQueries['2xl'].removeEventListener('change', handleChange)
      } else {
        // Fallback for older browsers
        mediaQueries.sm.removeListener(handleChange)
        mediaQueries.md.removeListener(handleChange)
        mediaQueries.lg.removeListener(handleChange)
        mediaQueries.xl.removeListener(handleChange)
        mediaQueries['2xl'].removeListener(handleChange)
      }
    }
  }, [])

  return breakpointState
}
