import { authRepository } from '@/repositories/auth.repository'
import { LoginBodyType } from '@/schemaValidations/auth.schema'
import { RoleType, TokenPayload } from '@/types/jwt.types'
import { comparePassword } from '@/utils/crypto'
import { AuthError, EntityError } from '@/utils/errors'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/utils/jwt'

const serializeAccount = (account: {
  id: number
  name: string
  email: string
  role: string
  avatar: string | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}) => ({
  id: account.id,
  name: account.name,
  email: account.email,
  role: account.role as RoleType,
  avatar: account.avatar ?? null,
  createdAt: account.createdAt,
  updatedAt: account.updatedAt,
  deletedAt: account.deletedAt
})

export const authService = {
  // Logout user
  async logout(refreshToken: string) {
    await authRepository.deleteRefreshToken(refreshToken)
    return 'Logout successfully'
  },

  // Login with email/password
  async login(body: LoginBodyType) {
    const account = await authRepository.findAccountByEmail(body.email)
    if (!account || account.deletedAt) {
      throw new EntityError([{ field: 'email', message: 'Email does not exist' }])
    }
    const isPasswordMatch = await comparePassword(body.password, account.password)
    if (!isPasswordMatch) {
      throw new EntityError([{ field: 'password', message: 'Email or password is incorrect' }])
    }

    const accessToken = signAccessToken({
      userId: account.id,
      role: account.role as RoleType
    })
    const refreshToken = signRefreshToken({
      userId: account.id,
      role: account.role as RoleType
    })
    const decodedRefreshToken = verifyRefreshToken(refreshToken)
    const refreshTokenExpiresAt = new Date(decodedRefreshToken.exp * 1000)

    await authRepository.createRefreshToken({
      accountId: account.id,
      token: refreshToken,
      expiresAt: refreshTokenExpiresAt
    })

    return {
      account: serializeAccount(account),
      accessToken,
      refreshToken
    }
  },

  // Refresh access token
  async refreshToken(refreshToken: string) {
    let decodedRefreshToken: TokenPayload
    try {
      decodedRefreshToken = verifyRefreshToken(refreshToken)
    } catch (error) {
      throw new AuthError('Refresh token is invalid')
    }

    const refreshTokenDoc = await authRepository.findRefreshToken(refreshToken)
    const account = refreshTokenDoc.account
    if (!account || account.deletedAt) {
      throw new AuthError('Account is no longer active')
    }

    const newAccessToken = signAccessToken({
      userId: account.id,
      role: account.role as RoleType
    })
    const newRefreshToken = signRefreshToken({
      userId: account.id,
      role: account.role as RoleType,
      exp: decodedRefreshToken.exp
    })

    await authRepository.deleteRefreshToken(refreshToken)
    await authRepository.createRefreshToken({
      accountId: account.id,
      token: newRefreshToken,
      expiresAt: refreshTokenDoc.expiresAt
    })

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    }
  }
}
