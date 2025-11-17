import {
  ChangePasswordBodyType,
  ChangePasswordV2BodyType,
  CreateAccountBodyType,
  UpdateAccountBodyType,
  UpdateMeBodyType
} from '@/schemaValidations/account.schema'
import { accountService } from '@/services/account.service'

export const initOwnerAccount = async () => accountService.initOwnerAccount()

export const createAccountController = async (body: CreateAccountBodyType) => accountService.createAccount(body)

export const getAccountsController = async () => accountService.getAccounts()

export const getAccountDetailController = async (accountId: number) => accountService.getAccountById(accountId)

export const updateAccountController = async (accountId: number, body: UpdateAccountBodyType) =>
  accountService.updateAccount(accountId, body)

export const deleteAccountController = async (accountId: number) => accountService.deleteAccount(accountId)

export const getMeController = async (accountId: number) => accountService.getMe(accountId)

export const updateMeController = async (accountId: number, body: UpdateMeBodyType) =>
  accountService.updateMe(accountId, body)

export const changePasswordController = async (accountId: number, body: ChangePasswordBodyType) =>
  accountService.changePassword(accountId, body)

export const changePasswordV2Controller = async (accountId: number, body: ChangePasswordV2BodyType) =>
  accountService.changePasswordV2(accountId, body)
