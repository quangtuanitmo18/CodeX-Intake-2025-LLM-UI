import { Role, RoleValues } from '@/constants/type'
import { LoginRes } from '@/schemaValidations/auth.schema'
import z from 'zod'

export const AccountSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(RoleValues),
  avatar: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable()
})

export type AccountType = z.TypeOf<typeof AccountSchema>

export const AccountListRes = z.object({
  data: z.array(AccountSchema),
  message: z.string()
})

export type AccountListResType = z.TypeOf<typeof AccountListRes>

export const AccountRes = z
  .object({
    data: AccountSchema,
    message: z.string()
  })
  .strict()

export type AccountResType = z.TypeOf<typeof AccountRes>

export const CreateAccountBody = z
  .object({
    name: z.string().trim().min(2).max(256),
    email: z.string().email(),
    avatar: z.string().optional(),
    password: z.string().min(6).max(100),
    confirmPassword: z.string().min(6).max(100),
    role: z.enum(RoleValues).optional().default(Role.User)
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'New password does not match',
        path: ['confirmPassword']
      })
    }
  })

export type CreateAccountBodyType = z.TypeOf<typeof CreateAccountBody>

export const UpdateAccountBody = z
  .object({
    name: z.string().trim().min(2).max(256).optional(),
    email: z.string().email().optional(),
    avatar: z.string().optional().nullable(),
    role: z.enum(RoleValues).optional(),
    password: z.string().min(6).max(100).optional(),
    confirmPassword: z.string().min(6).max(100).optional()
  })
  .strict()
  .refine(
    (data) => {
      if (data.password || data.confirmPassword) {
        return data.password && data.confirmPassword && data.password === data.confirmPassword
      }
      return true
    },
    {
      message: 'New password does not match',
      path: ['confirmPassword']
    }
  )

export type UpdateAccountBodyType = z.TypeOf<typeof UpdateAccountBody>

export const UpdateMeBody = z
  .object({
    name: z.string().trim().min(2).max(256).optional(),
    avatar: z.string().optional().nullable()
  })
  .strict()

export type UpdateMeBodyType = z.TypeOf<typeof UpdateMeBody>

export const ChangePasswordBody = z
  .object({
    oldPassword: z.string().min(6).max(100),
    password: z.string().min(6).max(100),
    confirmPassword: z.string().min(6).max(100)
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'New password does not match',
        path: ['confirmPassword']
      })
    }
  })

export type ChangePasswordBodyType = z.TypeOf<typeof ChangePasswordBody>

export const ChangePasswordV2Body = ChangePasswordBody

export type ChangePasswordV2BodyType = z.TypeOf<typeof ChangePasswordV2Body>

export const ChangePasswordV2Res = LoginRes

export type ChangePasswordV2ResType = z.TypeOf<typeof ChangePasswordV2Res>

export const AccountIdParam = z.object({
  id: z.coerce.number()
})

export type AccountIdParamType = z.TypeOf<typeof AccountIdParam>
