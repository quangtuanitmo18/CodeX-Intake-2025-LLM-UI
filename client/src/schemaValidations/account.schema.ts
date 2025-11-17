import { Role, RoleValues } from '@/constants/type'
import { LoginRes } from '@/schemaValidations/auth.schema'
import z from 'zod'

export const AccountSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(RoleValues),
  avatar: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
})

export type AccountType = z.infer<typeof AccountSchema>

export const AccountListRes = z.object({
  data: z.array(AccountSchema),
  message: z.string(),
})

export type AccountListResType = z.infer<typeof AccountListRes>

export const AccountRes = z.object({
  data: AccountSchema,
  message: z.string(),
})

export type AccountResType = z.infer<typeof AccountRes>

export const CreateAccountBody = z
  .object({
    name: z.string().trim().min(2).max(256),
    email: z.string().email(),
    avatar: z.string().optional(),
    password: z.string().min(6).max(100),
    confirmPassword: z.string().min(6).max(100),
    role: z.enum(RoleValues).default(Role.User),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      })
    }
  })

export type CreateAccountBodyType = z.infer<typeof CreateAccountBody>

export const UpdateAccountBody = z
  .object({
    name: z.string().trim().min(2).max(256).optional(),
    email: z.string().email().optional(),
    avatar: z.string().optional().nullable(),
    role: z.enum(RoleValues).optional(),
    password: z.string().min(6).max(100).optional(),
    confirmPassword: z.string().min(6).max(100).optional(),
  })
  .refine(
    (data) => {
      if (data.password || data.confirmPassword) {
        return data.password && data.confirmPassword && data.password === data.confirmPassword
      }
      return true
    },
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }
  )

export type UpdateAccountBodyType = z.infer<typeof UpdateAccountBody>

export const UpdateMeBody = z.object({
  name: z.string().trim().min(2).max(256).optional(),
  avatar: z.string().optional().nullable(),
})
export type UpdateMeBodyType = z.infer<typeof UpdateMeBody>

export const ChangePasswordBody = z
  .object({
    oldPassword: z.string().min(6).max(100),
    password: z.string().min(6).max(100),
    confirmPassword: z.string().min(6).max(100),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      })
    }
  })
export type ChangePasswordBodyType = z.infer<typeof ChangePasswordBody>

export const ChangePasswordV2Body = ChangePasswordBody
export type ChangePasswordV2BodyType = z.infer<typeof ChangePasswordV2Body>
export const ChangePasswordV2Res = LoginRes
export type ChangePasswordV2ResType = z.infer<typeof ChangePasswordV2Res>

export const AccountIdParam = z.object({
  id: z.coerce.number(),
})
export type AccountIdParamType = z.infer<typeof AccountIdParam>
