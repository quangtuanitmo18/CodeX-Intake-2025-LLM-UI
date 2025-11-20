import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const refreshToken = request.cookies.get('refreshToken')?.value
  const accessToken = request.cookies.get('accessToken')?.value

  const protectedPaths = ['/settings', '/llm']
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path))

  if (isProtected && !refreshToken) {
    const url = new URL('/login', request.url)
    url.searchParams.set('clearTokens', 'true')
    return NextResponse.redirect(url)
  }

  if (pathname === '/login' && refreshToken && accessToken) {
    return NextResponse.redirect(new URL('/llm', request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/settings/:path*', '/llm/:path*', '/login'],
}
