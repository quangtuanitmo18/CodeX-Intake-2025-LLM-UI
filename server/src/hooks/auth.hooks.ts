import { Role } from '@/constants/type'
import { AuthError } from '@/utils/errors'
import { verifyAccessToken } from '@/utils/jwt'
import { FastifyRequest } from 'fastify'

export const requireLoginedHook = async (request: FastifyRequest) => {
  const accessToken = request.headers.authorization?.split(' ')[1]
  if (!accessToken) throw new AuthError('Access token not received')
  try {
    const decodedAccessToken = verifyAccessToken(accessToken)
    request.decodedAccessToken = decodedAccessToken
    request.account = decodedAccessToken // Add account property
  } catch (error) {
    throw new AuthError('Invalid access token')
  }
}

export const requireAdminHook = async (request: FastifyRequest) => {
  if (request.decodedAccessToken?.role !== Role.Admin) {
    throw new AuthError('You do not have permission to access this resource')
  }
}
