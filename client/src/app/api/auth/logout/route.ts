import authApiRequest from '@/apiRequests/auth'
import { HttpError } from '@/lib/http'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refreshToken')?.value
  const accessToken = cookieStore.get('accessToken')?.value

  if (refreshToken && accessToken) {
    try {
      await authApiRequest.sLogout({ refreshToken, accessToken })
    } catch (error) {
      if (error instanceof HttpError) {
        return Response.json(error.payload, { status: error.status })
      }
    }
  }

  cookieStore.delete('accessToken')
  cookieStore.delete('refreshToken')

  return Response.json({ message: 'Logged out' })
}
