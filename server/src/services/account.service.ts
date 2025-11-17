import envConfig from '@/config'
import { PrismaErrorCode } from '@/constants/error-reference'
import { Role } from '@/constants/type'
import { accountRepository } from '@/repositories/account.repository'
import {
  ChangePasswordBodyType,
  ChangePasswordV2BodyType,
  CreateAccountBodyType,
  UpdateAccountBodyType,
  UpdateMeBodyType
} from '@/schemaValidations/account.schema'
import { RoleType } from '@/types/jwt.types'
import { comparePassword, hashPassword } from '@/utils/crypto'
import { EntityError, isPrismaClientKnownRequestError } from '@/utils/errors'
import { getChalk } from '@/utils/helpers'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/utils/jwt'

export const accountService = {
  async initOwnerAccount() {
    const accountCount = await accountRepository.count()
    if (accountCount === 0) {
      const hashedPassword = await hashPassword(envConfig.INITIAL_PASSWORD_USER)
      await accountRepository.createAccount({
        name: 'Admin',
        email: envConfig.INITIAL_EMAIL_USER,
        password: hashedPassword,
        role: Role.Admin
      })
      const chalk = await getChalk()
      console.log(
        chalk.bgCyan(`Created admin account: ${envConfig.INITIAL_EMAIL_USER}|${envConfig.INITIAL_PASSWORD_USER}`)
      )
    }
  },

  async createAccount(body: CreateAccountBodyType) {
    try {
      const hashedPassword = await hashPassword(body.password)
      return await accountRepository.createAccount({
        name: body.name,
        email: body.email,
        password: hashedPassword,
        avatar: body.avatar,
        role: body.role ?? Role.User
      })
    } catch (error: any) {
      if (isPrismaClientKnownRequestError(error) && error.code === PrismaErrorCode.UniqueConstraintViolation) {
        throw new EntityError([{ field: 'email', message: 'Email already exists' }])
      }
      throw error
    }
  },

  async getAccounts() {
    return await accountRepository.findAll()
  },

  async getAccountById(id: number) {
    return await accountRepository.findById(id)
  },

  async updateAccount(id: number, body: UpdateAccountBodyType) {
    try {
      const data: {
        name?: string
        email?: string
        avatar?: string | null
        role?: RoleType
        password?: string
      } = {}
      if (body.name) data.name = body.name
      if (body.email) data.email = body.email
      if (body.role) data.role = body.role as RoleType
      if (body.avatar !== undefined) data.avatar = body.avatar ?? null
      if (body.password) {
        data.password = await hashPassword(body.password)
      }
      return await accountRepository.update(id, data)
    } catch (error: any) {
      if (isPrismaClientKnownRequestError(error) && error.code === PrismaErrorCode.UniqueConstraintViolation) {
        throw new EntityError([{ field: 'email', message: 'Email already exists' }])
      }
      throw error
    }
  },

  async deleteAccount(id: number) {
    await accountRepository.deleteRefreshTokens(id)
    return await accountRepository.softDelete(id)
  },

  async getMe(accountId: number) {
    return await accountRepository.findById(accountId)
  },

  async updateMe(accountId: number, body: UpdateMeBodyType) {
    const data: { name?: string; avatar?: string | null } = {}
    if (body.name) data.name = body.name
    if (body.avatar !== undefined) data.avatar = body.avatar ?? null
    return await accountRepository.update(accountId, data)
  },

  async changePassword(accountId: number, body: ChangePasswordBodyType) {
    const account = await accountRepository.findById(accountId)
    const isSame = await comparePassword(body.oldPassword, account.password)
    if (!isSame) {
      throw new EntityError([{ field: 'oldPassword', message: 'Old password is incorrect' }])
    }
    const hashedPassword = await hashPassword(body.password)
    return await accountRepository.updatePassword(accountId, hashedPassword)
  },

  async changePasswordV2(accountId: number, body: ChangePasswordV2BodyType) {
    const account = await this.changePassword(accountId, body)

    await accountRepository.deleteRefreshTokens(accountId)
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

    await accountRepository.createRefreshToken({
      accountId: account.id,
      token: refreshToken,
      expiresAt: refreshTokenExpiresAt
    })

    return {
      account,
      accessToken,
      refreshToken
    }
  }
}
