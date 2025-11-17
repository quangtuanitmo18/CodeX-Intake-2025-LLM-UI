'use client'

import { getAccessTokenFromLocalStorage, getRefreshTokenFromLocalStorage } from '@/lib/utils'
import { useLogoutMutation } from '@/queries/useAuth'
import { useRouter, useSearchParams } from 'next/navigation'
import { memo, Suspense, useEffect, useRef } from 'react'

function LogoutComponent() {
  const { mutateAsync } = useLogoutMutation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const refreshTokenFromUrl = searchParams.get('refreshToken')
  const accessTokenFromUrl = searchParams.get('accessToken')
  const ref = useRef<any>(null)
  useEffect(() => {
    if (
      !ref.current &&
      ((refreshTokenFromUrl && refreshTokenFromUrl === getRefreshTokenFromLocalStorage()) ||
        (accessTokenFromUrl && accessTokenFromUrl === getAccessTokenFromLocalStorage()))
    ) {
      ref.current = mutateAsync
      mutateAsync().then((res) => {
        setTimeout(() => {
          ref.current = null
        }, 1000)
        router.push('/login')
      })
    } else if (accessTokenFromUrl !== getAccessTokenFromLocalStorage()) {
      router.push('/')
    }
  }, [mutateAsync, router, refreshTokenFromUrl, accessTokenFromUrl])
  return null
}

const Logout = memo(function LogoutInner() {
  return (
    <Suspense>
      <LogoutComponent />
    </Suspense>
  )
})

export default Logout
