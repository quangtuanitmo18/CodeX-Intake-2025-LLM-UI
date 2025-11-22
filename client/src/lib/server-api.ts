import envConfig from '@/config'
import { normalizePath } from '@/lib/utils'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function serverGet<T>(path: string, init?: RequestInit): Promise<T> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value
  if (!accessToken) {
    redirect('/login')
  }

  // Use API_ENDPOINT for server-side (Docker service name), fallback to NEXT_PUBLIC_API_ENDPOINT
  const apiEndpoint = envConfig.API_ENDPOINT || envConfig.NEXT_PUBLIC_API_ENDPOINT
  const res = await fetch(`${apiEndpoint}/${normalizePath(path)}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers as Record<string, string>),
    },
    next: init?.next ?? { revalidate: 0 },
    cache: init?.cache ?? 'no-store',
  })

  if (res.status === 401) {
    redirect('/login')
  }

  if (!res.ok) {
    throw new Error(`Server request failed: ${res.status}`)
  }

  return (await res.json()) as T
}
