import { HttpError } from '@/lib/http'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { accessToken, refreshToken } = (await request.json()) as {
    accessToken: string
    refreshToken: string
  }
  const cookieStore = await cookies()

  try {
    const decodedAccessToken = jwt.decode(accessToken) as { exp: number }
    const decodedRefreshToken = jwt.decode(refreshToken) as { exp: number }

    cookieStore.set('accessToken', accessToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires: decodedAccessToken.exp * 1000,
    })
    cookieStore.set('refreshToken', refreshToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires: decodedRefreshToken.exp * 1000,
    })

    return Response.json({ accessToken, refreshToken })
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json(error.payload, { status: error.status })
    }
    return Response.json({ message: 'Unable to set tokens' }, { status: 500 })
  }
}
