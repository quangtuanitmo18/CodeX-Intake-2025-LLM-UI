'use client'

import { toast } from '@/components/ui/use-toast'
import { useSetTokenToCookieMutation } from '@/queries/useAuth'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

export default function Oauth() {
  const { mutateAsync } = useSetTokenToCookieMutation()
  const router = useRouter()
  const count = useRef(0)

  const searchParams = useSearchParams()
  const accessToken = searchParams.get('accessToken')
  const refreshToken = searchParams.get('refreshToken')
  const message = searchParams.get('message')
  useEffect(() => {
    if (accessToken && refreshToken) {
      if (count.current === 0) {
        mutateAsync({ accessToken, refreshToken })
          .then(() => {
            router.push('/dashboard')
          })
          .catch((e) => {
            toast({
              description: e.message || 'An error occurred',
            })
          })
        count.current++
      }
    } else {
      if (count.current === 0) {
        setTimeout(() => {
          toast({
            description: message || 'An error occurred',
          })
        })
        count.current++
      }
    }
  }, [accessToken, refreshToken, router, message, mutateAsync])
  return null
}
