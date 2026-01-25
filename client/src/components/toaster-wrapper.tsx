'use client'

import dynamic from 'next/dynamic'

// Dynamically import Toaster to reduce initial bundle size
const Toaster = dynamic(() => import('@/components/ui/toaster').then((mod) => mod.Toaster), {
  ssr: false,
})

export default function ToasterWrapper() {
  return <Toaster />
}
