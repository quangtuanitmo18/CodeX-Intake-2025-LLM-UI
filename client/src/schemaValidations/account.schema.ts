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
    name: z
      .string({ required_error: 'Name is required' })
      .trim()
      .min(2, { message: 'Name must be at least 2 characters' })
      .max(256, { message: 'Name must not exceed 256 characters' }),
    email: z
      .string({ required_error: 'Email is required' })
      .email({ message: 'Please enter a valid email address' }),
    avatar: z.string().optional(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, { message: 'Password must be at least 6 characters' })
      .max(100, { message: 'Password must not exceed 100 characters' }),
    confirmPassword: z
      .string({ required_error: 'Confirm password is required' })
      .min(6, { message: 'Confirm password must be at least 6 characters' })
      .max(100, { message: 'Confirm password must not exceed 100 characters' }),
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
    name: z
      .string()
      .trim()
      .min(2, { message: 'Name must be at least 2 characters' })
      .max(256, { message: 'Name must not exceed 256 characters' })
      .optional(),
    email: z.string().email({ message: 'Please enter a valid email address' }).optional(),
    avatar: z.string().optional().nullable(),
    role: z.enum(RoleValues).optional(),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters' })
      .max(100, { message: 'Password must not exceed 100 characters' })
      .optional(),
    confirmPassword: z
      .string()
      .min(6, { message: 'Confirm password must be at least 6 characters' })
      .max(100, { message: 'Confirm password must not exceed 100 characters' })
      .optional(),
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
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(256, { message: 'Name must not exceed 256 characters' })
    .optional(),
  avatar: z.string().optional().nullable(),
})
export type UpdateMeBodyType = z.infer<typeof UpdateMeBody>

export const ChangePasswordBody = z
  .object({
    oldPassword: z
      .string({ required_error: 'Old password is required' })
      .min(6, { message: 'Old password must be at least 6 characters' })
      .max(100, { message: 'Old password must not exceed 100 characters' }),
    password: z
      .string({ required_error: 'New password is required' })
      .min(6, { message: 'New password must be at least 6 characters' })
      .max(100, { message: 'New password must not exceed 100 characters' }),
    confirmPassword: z
      .string({ required_error: 'Confirm password is required' })
      .min(6, { message: 'Confirm password must be at least 6 characters' })
      .max(100, { message: 'Confirm password must not exceed 100 characters' }),
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
