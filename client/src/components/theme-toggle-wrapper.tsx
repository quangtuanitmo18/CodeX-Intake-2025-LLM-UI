'use client'

import dynamic from 'next/dynamic'

// Dynamically import ThemeToggle to avoid SSR issues
const ThemeToggle = dynamic(
  () => import('@/components/theme-toggle').then((mod) => mod.ThemeToggle),
  { ssr: false }
)

export function ThemeToggleWrapper() {
  return <ThemeToggle />
}
