import { CreateMessageBodyType, ListMessagesQueryType } from '@/schemaValidations/message.schema'
import { messageService } from '@/services/message.service'

export const listMessagesController = async (conversationId: string, accountId: number, query: ListMessagesQueryType) =>
  messageService.list(conversationId, accountId, query)

export const createMessageController = async (conversationId: string, accountId: number, body: CreateMessageBodyType) =>
  messageService.createUserMessage(conversationId, accountId, body.content, body.attachments)
