import {
  changePasswordController,
  changePasswordV2Controller,
  createAccountController,
  deleteAccountController,
  getAccountDetailController,
  getAccountsController,
  getMeController,
  updateAccountController,
  updateMeController
} from '@/controllers/account.controller'
import { requireAdminHook, requireLoginedHook } from '@/hooks/auth.hooks'
import {
  AccountIdParam,
  AccountIdParamType,
  AccountListRes,
  AccountListResType,
  AccountRes,
  AccountResType,
  ChangePasswordBody,
  ChangePasswordBodyType,
  ChangePasswordV2Body,
  ChangePasswordV2BodyType,
  ChangePasswordV2Res,
  ChangePasswordV2ResType,
  CreateAccountBody,
  CreateAccountBodyType,
  UpdateAccountBody,
  UpdateAccountBodyType,
  UpdateMeBody,
  UpdateMeBodyType
} from '@/schemaValidations/account.schema'
import { MessageRes, MessageResType } from '@/schemaValidations/common.schema'
import { FastifyInstance, FastifyPluginOptions } from 'fastify'

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
  role: account.role,
  avatar: account.avatar ?? null,
  createdAt: account.createdAt,
  updatedAt: account.updatedAt,
  deletedAt: account.deletedAt
})

export default async function accountRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.addHook('preValidation', fastify.auth([requireLoginedHook]))

  fastify.get<{ Reply: AccountListResType }>(
    '/',
    {
      schema: {
        response: {
          200: AccountListRes
        }
      },
      preValidation: fastify.auth([requireAdminHook])
    },
    async (_request, reply) => {
      const accounts = await getAccountsController()
      reply.send({
        data: accounts.map(serializeAccount) as AccountListResType['data'],
        message: 'Get account list successfully'
      })
    }
  )

  fastify.post<{ Reply: AccountResType; Body: CreateAccountBodyType }>(
    '/',
    {
      schema: {
        response: {
          200: AccountRes
        },
        body: CreateAccountBody
      },
      preValidation: fastify.auth([requireAdminHook])
    },
    async (request, reply) => {
      const account = await createAccountController(request.body)
      reply.send({
        data: serializeAccount(account) as AccountResType['data'],
        message: 'Create account successfully'
      })
    }
  )

  fastify.get<{ Reply: AccountResType }>(
    '/me',
    {
      schema: {
        response: {
          200: AccountRes
        }
      }
    },
    async (request, reply) => {
      const account = await getMeController(request.decodedAccessToken?.userId as number)
      reply.send({
        data: serializeAccount(account) as AccountResType['data'],
        message: 'Get profile successfully'
      })
    }
  )

  fastify.patch<{ Reply: AccountResType; Body: UpdateMeBodyType }>(
    '/me',
    {
      schema: {
        response: {
          200: AccountRes
        },
        body: UpdateMeBody
      }
    },
    async (request, reply) => {
      const account = await updateMeController(request.decodedAccessToken?.userId as number, request.body)
      reply.send({
        data: serializeAccount(account) as AccountResType['data'],
        message: 'Update profile successfully'
      })
    }
  )

  fastify.patch<{ Reply: MessageResType; Body: ChangePasswordBodyType }>(
    '/me/change-password',
    {
      schema: {
        response: {
          200: MessageRes
        },
        body: ChangePasswordBody
      }
    },
    async (request, reply) => {
      await changePasswordController(request.decodedAccessToken?.userId as number, request.body)
      reply.send({
        message: 'Change password successfully'
      })
    }
  )

  fastify.patch<{ Reply: ChangePasswordV2ResType; Body: ChangePasswordV2BodyType }>(
    '/me/change-password-with-tokens',
    {
      schema: {
        response: {
          200: ChangePasswordV2Res
        },
        body: ChangePasswordV2Body
      }
    },
    async (request, reply) => {
      const result = await changePasswordV2Controller(request.decodedAccessToken?.userId as number, request.body)
      reply.send({
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          account: serializeAccount(result.account)
        } as ChangePasswordV2ResType['data'],
        message: 'Change password successfully'
      })
    }
  )

  fastify.get<{ Reply: AccountResType; Params: AccountIdParamType }>(
    '/:id',
    {
      schema: {
        response: {
          200: AccountRes
        },
        params: AccountIdParam
      },
      preValidation: fastify.auth([requireAdminHook])
    },
    async (request, reply) => {
      const account = await getAccountDetailController(request.params.id)
      reply.send({
        data: serializeAccount(account) as AccountResType['data'],
        message: 'Get account successfully'
      })
    }
  )

  fastify.patch<{ Reply: AccountResType; Params: AccountIdParamType; Body: UpdateAccountBodyType }>(
    '/:id',
    {
      schema: {
        response: {
          200: AccountRes
        },
        params: AccountIdParam,
        body: UpdateAccountBody
      },
      preValidation: fastify.auth([requireAdminHook])
    },
    async (request, reply) => {
      const account = await updateAccountController(request.params.id, request.body)
      reply.send({
        data: serializeAccount(account) as AccountResType['data'],
        message: 'Update account successfully'
      })
    }
  )

  fastify.delete<{ Reply: MessageResType; Params: AccountIdParamType }>(
    '/:id',
    {
      schema: {
        response: {
          200: MessageRes
        },
        params: AccountIdParam
      },
      preValidation: fastify.auth([requireAdminHook])
    },
    async (request, reply) => {
      await deleteAccountController(request.params.id)
      reply.send({
        message: 'Delete account successfully'
      })
    }
  )
}
