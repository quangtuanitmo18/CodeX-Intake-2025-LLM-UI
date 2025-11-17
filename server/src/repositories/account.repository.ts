import prisma from '@/database'
import { RoleType } from '@/types/jwt.types'

export const accountRepository = {
  async count() {
    return prisma.account.count({
      where: {
        deletedAt: null
      }
    })
  },

  async createAccount(data: { name: string; email: string; password: string; avatar?: string; role: RoleType }) {
    return prisma.account.create({
      data
    })
  },

  async findAll() {
    return prisma.account.findMany({
      where: {
        deletedAt: null
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  },

  async findById(id: number) {
    return prisma.account.findFirstOrThrow({
      where: {
        id,
        deletedAt: null
      }
    })
  },

  async findByEmail(email: string) {
    return prisma.account.findFirst({
      where: {
        email,
        deletedAt: null
      }
    })
  },

  async update(
    id: number,
    data: { name?: string; email?: string; avatar?: string | null; role?: RoleType; password?: string }
  ) {
    return prisma.account.update({
      where: { id },
      data
    })
  },

  async updatePassword(id: number, password: string) {
    return prisma.account.update({
      where: { id },
      data: { password }
    })
  },

  async softDelete(id: number) {
    return prisma.account.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    })
  },

  async deleteRefreshTokens(accountId: number) {
    return prisma.refreshToken.deleteMany({
      where: { accountId }
    })
  },

  async createRefreshToken(data: { accountId: number; token: string; expiresAt: Date }) {
    return prisma.refreshToken.create({
      data
    })
  }
}
