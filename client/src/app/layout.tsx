import AppProvider from '@/components/app-provider'
import ToasterWrapper from '@/components/toaster-wrapper'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'LLM UI Boilerplate',
  description: 'Minimal Next.js starter focused on auth/account flows.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen overflow-x-hidden bg-background text-foreground antialiased">
        <AppProvider>
          {children}
          <Suspense fallback={null}>
            <ToasterWrapper />
          </Suspense>
        </AppProvider>
      </body>
    </html>
  )
}
