import authApiRequest from '@/apiRequests/auth'
import { toast } from '@/components/ui/use-toast'
import { EntityError } from '@/lib/http'
import { TokenPayload } from '@/types/jwt.types'
import { type ClassValue, clsx } from 'clsx'
import { jwtDecode } from 'jwt-decode'
import { UseFormSetError } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const normalizePath = (path: string) => (path.startsWith('/') ? path.slice(1) : path)

export const handleErrorApi = ({
  error,
  setError,
  duration,
}: {
  error: any
  setError?: UseFormSetError<any>
  duration?: number
}) => {
  if (error instanceof EntityError && setError) {
    error.payload.errors.forEach((item) => {
      setError(item.field, {
        type: 'server',
        message: item.message,
      })
    })
    return
  }

  toast({
    title: 'Error',
    description: error?.payload?.message ?? 'Something went wrong',
    variant: 'destructive',
    duration: duration ?? 5000,
  })
}

const isBrowser = typeof window !== 'undefined'

export const getAccessTokenFromLocalStorage = () =>
  isBrowser ? localStorage.getItem('accessToken') : null

export const getRefreshTokenFromLocalStorage = () =>
  isBrowser ? localStorage.getItem('refreshToken') : null

export const setAccessTokenToLocalStorage = (value: string) => {
  if (isBrowser) localStorage.setItem('accessToken', value)
}

export const setRefreshTokenToLocalStorage = (value: string) => {
  if (isBrowser) localStorage.setItem('refreshToken', value)
}

export const removeTokensFromLocalStorage = () => {
  if (isBrowser) {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }
}

export const decodeToken = (token: string) => {
  return jwtDecode(token) as TokenPayload
}

export const checkAndRefreshToken = async (param?: {
  onError?: () => void
  onSuccess?: () => void
  force?: boolean
}) => {
  const accessToken = getAccessTokenFromLocalStorage()
  const refreshToken = getRefreshTokenFromLocalStorage()
  if (!accessToken || !refreshToken) return

  const decodedAccessToken = decodeToken(accessToken)
  const decodedRefreshToken = decodeToken(refreshToken)
  const now = Math.round(Date.now() / 1000)

  if (decodedRefreshToken.exp <= now) {
    removeTokensFromLocalStorage()
    return param?.onError && param.onError()
  }

  const accessTokenLifetime = decodedAccessToken.exp - decodedAccessToken.iat
  const remainingLifetime = decodedAccessToken.exp - now
  const shouldRefresh = param?.force || remainingLifetime < accessTokenLifetime / 3
  if (!shouldRefresh) return

  try {
    const res = await authApiRequest.refreshToken()
    setAccessTokenToLocalStorage(res.payload.data.accessToken)
    setRefreshTokenToLocalStorage(res.payload.data.refreshToken)
    param?.onSuccess && param.onSuccess()
  } catch {
    removeTokensFromLocalStorage()
    param?.onError && param.onError()
  }
}

export const wrapServerApi = async <T>(fn: () => Promise<T>) => {
  try {
    return await fn()
  } catch (error: any) {
    if (error?.digest?.includes('NEXT_REDIRECT')) {
      throw error
    }
    return null
  }
}
