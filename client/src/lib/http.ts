import authApiRequest from '@/apiRequests/auth'
import envConfig from '@/config'
import {
  getAccessTokenFromLocalStorage,
  getRefreshTokenFromLocalStorage,
  normalizePath,
  removeTokensFromLocalStorage,
  setAccessTokenToLocalStorage,
  setRefreshTokenToLocalStorage,
} from '@/lib/utils'
import { LoginResType } from '@/schemaValidations/auth.schema'

type CustomOptions = Omit<RequestInit, 'method'> & {
  baseUrl?: string
  params?: Record<string, any>
}

const ENTITY_ERROR_STATUS = 422
const AUTH_ERROR_STATUS = 401

// Track ongoing refresh token request to prevent multiple simultaneous refreshes
let refreshTokenPromise: Promise<{ accessToken: string; refreshToken: string }> | null = null

type EntityErrorPayload = {
  message: string
  errors: { field: string; message: string }[]
}

export class HttpError extends Error {
  status: number
  payload: {
    message: string
    [key: string]: any
  }
  constructor({
    status,
    payload,
    message = 'HTTP Error',
  }: {
    status: number
    payload: any
    message?: string
  }) {
    super(message)
    this.status = status
    this.payload = payload
  }
}

export class EntityError extends HttpError {
  status: typeof ENTITY_ERROR_STATUS
  payload: EntityErrorPayload
  constructor({
    status,
    payload,
  }: {
    status: typeof ENTITY_ERROR_STATUS
    payload: EntityErrorPayload
  }) {
    super({ status, payload, message: 'Entity Error' })
    this.status = status
    this.payload = payload
  }
}

const isClient = typeof window !== 'undefined'

const request = async <Response>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  options?: CustomOptions,
  retryCount = 0
): Promise<{ status: number; payload: Response }> => {
  let body: FormData | string | undefined
  if (options?.body instanceof FormData) {
    body = options.body
  } else if (options?.body !== undefined) {
    body = JSON.stringify(options.body)
  }

  const headers: Record<string, string> =
    body instanceof FormData
      ? {}
      : {
          'Content-Type': 'application/json',
        }

  if (isClient) {
    const accessToken = getAccessTokenFromLocalStorage()
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`
  }

  // Use API_ENDPOINT for server-side (Docker service name), NEXT_PUBLIC_API_ENDPOINT for client-side
  const defaultBaseUrl =
    !isClient && envConfig.API_ENDPOINT
      ? envConfig.API_ENDPOINT
      : envConfig.NEXT_PUBLIC_API_ENDPOINT
  const baseUrl = options?.baseUrl === undefined ? defaultBaseUrl : (options.baseUrl ?? '')

  let fullUrl = `${baseUrl}/${normalizePath(url)}`
  if (options?.params) {
    const queryString = new URLSearchParams(
      Object.entries(options.params)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => [key, String(value)])
    ).toString()
    if (queryString) {
      fullUrl += `?${queryString}`
    }
  }

  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      ...headers,
      ...(options?.headers as Record<string, string>),
    },
    body,
    method,
  })

  const payload = (await res.json()) as Response
  const data = {
    status: res.status,
    payload,
  }

  if (!res.ok) {
    if (res.status === ENTITY_ERROR_STATUS) {
      throw new EntityError(
        data as {
          status: typeof ENTITY_ERROR_STATUS
          payload: EntityErrorPayload
        }
      )
    }

    if (res.status === AUTH_ERROR_STATUS && isClient) {
      const normalizedUrl = normalizePath(url)

      // Don't retry refresh token endpoint or login endpoint
      if (normalizedUrl === 'api/auth/refresh-token' || normalizedUrl === 'api/auth/login') {
        removeTokensFromLocalStorage()
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login'
        }
        return data
      }

      // Try to refresh token if we haven't retried yet
      if (retryCount === 0) {
        const refreshToken = getRefreshTokenFromLocalStorage()
        if (refreshToken) {
          try {
            // Use existing refresh promise if available to prevent multiple simultaneous refreshes
            if (!refreshTokenPromise) {
              refreshTokenPromise = (async () => {
                try {
                  const res = await authApiRequest.refreshToken()
                  const { accessToken, refreshToken: newRefreshToken } = res.payload.data
                  setAccessTokenToLocalStorage(accessToken)
                  setRefreshTokenToLocalStorage(newRefreshToken)
                  return { accessToken, refreshToken: newRefreshToken }
                } finally {
                  refreshTokenPromise = null
                }
              })()
            }

            await refreshTokenPromise

            // Retry the original request with new token
            return request<Response>(method, url, options, retryCount + 1)
          } catch (error) {
            // Refresh failed, clear tokens and redirect to login
            removeTokensFromLocalStorage()
            refreshTokenPromise = null
            if (!window.location.pathname.startsWith('/login')) {
              window.location.href = '/login'
            }
            return data
          }
        }
      }

      // No refresh token or retry failed, redirect to login
      removeTokensFromLocalStorage()
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
      return data
    }

    throw new HttpError(data)
  }

  if (isClient) {
    const normalizedUrl = normalizePath(url)
    if (normalizedUrl === 'api/auth/login') {
      const { accessToken, refreshToken } = (payload as LoginResType).data
      setAccessTokenToLocalStorage(accessToken)
      setRefreshTokenToLocalStorage(refreshToken)
    } else if (normalizedUrl === 'api/auth/token') {
      const { accessToken, refreshToken } = payload as { accessToken: string; refreshToken: string }
      setAccessTokenToLocalStorage(accessToken)
      setRefreshTokenToLocalStorage(refreshToken)
    } else if (normalizedUrl === 'api/auth/logout') {
      removeTokensFromLocalStorage()
    }
  }

  return data
}

const http = {
  get<Response>(url: string, options?: Omit<CustomOptions, 'body'>) {
    return request<Response>('GET', url, options)
  },
  post<Response>(url: string, body: any, options?: Omit<CustomOptions, 'body'>) {
    return request<Response>('POST', url, { ...options, body })
  },
  put<Response>(url: string, body: any, options?: Omit<CustomOptions, 'body'>) {
    return request<Response>('PUT', url, { ...options, body })
  },
  patch<Response>(url: string, body: any, options?: Omit<CustomOptions, 'body'>) {
    return request<Response>('PATCH', url, { ...options, body })
  },
  delete<Response>(url: string, options?: Omit<CustomOptions, 'body'>) {
    return request<Response>('DELETE', url, options)
  },
}

export default http
