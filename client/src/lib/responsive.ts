import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'

/**
 * Tailwind CSS breakpoint values (matching tailwind.config.ts)
 * These constants can be used in JavaScript/TypeScript code
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1920,
} as const

/**
 * Breakpoint names as array for iteration
 */
export const BREAKPOINT_NAMES = ['sm', 'md', 'lg', 'xl', '2xl'] as const

/**
 * Type for breakpoint names
 */
export type BreakpointName = (typeof BREAKPOINT_NAMES)[number]

/**
 * Responsive value map type
 * Maps breakpoint names to values
 */
export type ResponsiveValue<T> = {
  base?: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
  '2xl'?: T
}

/**
 * Get responsive value based on current breakpoint
 *
 * @param values - Object mapping breakpoints to values
 * @param currentBreakpoint - Current breakpoint name
 * @returns The value for the current breakpoint, or the closest smaller breakpoint value
 *
 * @example
 * ```tsx
 * const padding = getResponsiveValue({
 *   base: 'p-4',
 *   md: 'p-6',
 *   lg: 'p-8',
 * }, 'lg') // Returns 'p-8'
 * ```
 */
export function getResponsiveValue<T>(
  values: ResponsiveValue<T>,
  currentBreakpoint: BreakpointName | 'base'
): T | undefined {
  // If base value exists and we're at base, return it
  if (currentBreakpoint === 'base') {
    return values.base
  }

  // Find the index of current breakpoint
  const currentIndex = BREAKPOINT_NAMES.indexOf(currentBreakpoint as BreakpointName)

  // Try to find value for current breakpoint or closest smaller one
  for (let i = currentIndex; i >= 0; i--) {
    const breakpoint = BREAKPOINT_NAMES[i]
    if (values[breakpoint] !== undefined) {
      return values[breakpoint]
    }
  }

  // Fallback to base value
  return values.base
}

/**
 * Generate responsive Tailwind classes from a value map
 *
 * @param classMap - Object mapping breakpoints to class strings
 * @returns Merged class string with responsive prefixes
 *
 * @example
 * ```tsx
 * const classes = generateResponsiveClasses({
 *   base: 'p-4 text-sm',
 *   md: 'p-6 text-base',
 *   lg: 'p-8 text-lg',
 * })
 * // Returns: 'p-4 text-sm md:p-6 md:text-base lg:p-8 lg:text-lg'
 * ```
 */
export function generateResponsiveClasses(classMap: ResponsiveValue<string>): string {
  const classes: string[] = []

  // Add base classes
  if (classMap.base) {
    classes.push(classMap.base)
  }

  // Add responsive classes with breakpoint prefixes
  for (const breakpoint of BREAKPOINT_NAMES) {
    if (classMap[breakpoint]) {
      const prefix = `${breakpoint}:`
      const responsiveClasses = classMap[breakpoint]!.split(' ')
        .map((cls) => `${prefix}${cls}`)
        .join(' ')
      classes.push(responsiveClasses)
    }
  }

  return classes.join(' ')
}

/**
 * Check if a breakpoint matches the current viewport width
 *
 * @param breakpoint - Breakpoint name to check
 * @param width - Current viewport width
 * @returns True if viewport width is >= breakpoint value
 *
 * @example
 * ```tsx
 * const isTablet = isBreakpoint('md', 800) // Returns true
 * ```
 */
export function isBreakpoint(breakpoint: BreakpointName, width: number): boolean {
  return width >= BREAKPOINTS[breakpoint]
}

/**
 * Get the current breakpoint name based on viewport width
 *
 * @param width - Current viewport width
 * @returns The name of the largest breakpoint that matches, or 'base' if none match
 *
 * @example
 * ```tsx
 * const breakpoint = getCurrentBreakpoint(1200) // Returns 'lg'
 * ```
 */
export function getCurrentBreakpoint(width: number): BreakpointName | 'base' {
  // Check from largest to smallest
  for (let i = BREAKPOINT_NAMES.length - 1; i >= 0; i--) {
    const breakpoint = BREAKPOINT_NAMES[i]
    if (width >= BREAKPOINTS[breakpoint]) {
      return breakpoint
    }
  }
  return 'base'
}

/**
 * Merge responsive class values with clsx and twMerge
 * Useful for combining responsive classes with conditional classes
 *
 * @param classMap - Object mapping breakpoints to class strings or ClassValue arrays
 * @param additionalClasses - Additional classes to merge
 * @returns Merged class string
 *
 * @example
 * ```tsx
 * const classes = mergeResponsiveClasses(
 *   { base: 'p-4', md: 'p-6' },
 *   'text-white',
 *   isActive && 'bg-blue-500'
 * )
 * ```
 */
export function mergeResponsiveClasses(
  classMap: ResponsiveValue<ClassValue>,
  ...additionalClasses: ClassValue[]
): string {
  const responsiveClasses = generateResponsiveClasses(
    Object.fromEntries(
      Object.entries(classMap).map(([key, value]) => [
        key,
        typeof value === 'string' ? value : clsx(value),
      ])
    ) as ResponsiveValue<string>
  )

  return clsx(responsiveClasses, ...additionalClasses)
}

/**
 * Create a responsive value selector function
 * Returns a function that selects the appropriate value based on breakpoint
 *
 * @param values - Object mapping breakpoints to values
 * @returns Function that takes a breakpoint and returns the value
 *
 * @example
 * ```tsx
 * const getPadding = createResponsiveSelector({
 *   base: 16,
 *   md: 24,
 *   lg: 32,
 * })
 *
 * const padding = getPadding('lg') // Returns 32
 * ```
 */
export function createResponsiveSelector<T>(values: ResponsiveValue<T>) {
  return (breakpoint: BreakpointName | 'base'): T | undefined => {
    return getResponsiveValue(values, breakpoint)
  }
}

/**
 * Check if viewport is mobile (< 768px)
 *
 * @param width - Viewport width
 * @returns True if mobile
 */
export function isMobile(width: number): boolean {
  return width < BREAKPOINTS.md
}

/**
 * Check if viewport is tablet (768px - 1023px)
 *
 * @param width - Viewport width
 * @returns True if tablet
 */
export function isTablet(width: number): boolean {
  return width >= BREAKPOINTS.md && width < BREAKPOINTS.lg
}

/**
 * Check if viewport is desktop (>= 1024px)
 *
 * @param width - Viewport width
 * @returns True if desktop
 */
export function isDesktop(width: number): boolean {
  return width >= BREAKPOINTS.lg
}
