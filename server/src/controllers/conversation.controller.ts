import {
  CreateConversationBodyType,
  ExportConversationQueryType,
  ListConversationsQueryType,
  UpdateConversationBodyType
} from '@/schemaValidations/conversation.schema'
import { conversationService } from '@/services/conversation.service'

export const listConversationsController = async (accountId: number, query: ListConversationsQueryType) =>
  conversationService.list(accountId, query)

export const getConversationController = async (id: string, accountId: number) => conversationService.get(id, accountId)

export const createConversationController = async (accountId: number, body: CreateConversationBodyType) =>
  conversationService.create(accountId, body)

export const updateConversationController = async (id: string, accountId: number, body: UpdateConversationBodyType) =>
  conversationService.updateTitle(id, accountId, body.title)

export const deleteConversationController = async (id: string, accountId: number) =>
  conversationService.delete(id, accountId)

export const exportConversationController = async (
  id: string,
  accountId: number,
  query: ExportConversationQueryType
) => {
  if (query.format === 'markdown') {
    return conversationService.exportToMarkdown(id, accountId)
  }
  return conversationService.exportToJSON(id, accountId)
}
