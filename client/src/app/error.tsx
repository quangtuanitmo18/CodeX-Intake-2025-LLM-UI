'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { useEffect } from 'react'

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Global error boundary captured an error:', error)
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        <div className="flex min-h-screen items-center justify-center px-4">
          <Card className="max-w-md border-slate-800 bg-slate-900/70 text-left shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <p>We hit an unexpected error while rendering this page.</p>
              {error.digest && (
                <p className="text-xs text-slate-500">
                  Error ID: <span className="font-mono">{error.digest}</span>
                </p>
              )}
              <div className="flex gap-2">
                <Button onClick={reset} className="flex-1">
                  Try again
                </Button>
                <Link href="/" className="flex-1">
                  <Button variant="secondary" className="w-full">
                    Back home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}
