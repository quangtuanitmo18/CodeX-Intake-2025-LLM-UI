import http from '@/lib/http'
import {
  AccountListResType,
  AccountResType,
  ChangePasswordBodyType,
  CreateAccountBodyType,
  UpdateAccountBodyType,
  UpdateMeBodyType,
} from '@/schemaValidations/account.schema'
import { MessageResType } from '@/schemaValidations/common.schema'

const prefix = '/accounts'

const accountApiRequest = {
  me: () => http.get<AccountResType>(`${prefix}/me`),
  sMe: (accessToken: string) =>
    http.get<AccountResType>(`${prefix}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
  updateMe: (body: UpdateMeBodyType) => http.patch<AccountResType>(`${prefix}/me`, body),
  changePassword: (body: ChangePasswordBodyType) =>
    http.patch<MessageResType>(`${prefix}/me/change-password`, body),
  list: () => http.get<AccountListResType>(prefix),
  createAccount: (body: CreateAccountBodyType) => http.post<AccountResType>(prefix, body),
  getAccount: (id: number) => http.get<AccountResType>(`${prefix}/${id}`),
  updateAccount: (id: number, body: UpdateAccountBodyType) =>
    http.patch<AccountResType>(`${prefix}/${id}`, body),
  deleteAccount: (id: number) => http.delete(`${prefix}/${id}`),
}

export default accountApiRequest
