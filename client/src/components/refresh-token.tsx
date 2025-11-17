'use client'

import { checkAndRefreshToken } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

// Những page sau sẽ không check refresh token
const UNAUTHENTICATED_PATH = ['/login', '/logout']
export default function RefreshToken() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (UNAUTHENTICATED_PATH.some((path) => pathname.startsWith(path))) return

    let interval: NodeJS.Timeout | null = null

    // Phải gọi lần đầu tiên, vì interval sẽ chạy sau thời gian TIMEOUT
    const onRefreshToken = (force?: boolean) => {
      checkAndRefreshToken({
        onError: () => {
          if (interval) clearInterval(interval)
          router.push('/login')
        },
        force,
      })
    }

    onRefreshToken()
    // Timeout interval phải bé hơn thời gian hết hạn của access token
    // Ví dụ thời gian hết hạn access token là 10s thì 1s mình sẽ cho check 1 lần
    const TIMEOUT = 1000
    interval = setInterval(onRefreshToken, TIMEOUT)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [pathname, router])

  return null
}
