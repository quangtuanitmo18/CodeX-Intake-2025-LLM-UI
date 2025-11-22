import { createMessageController, listMessagesController } from '@/controllers/message.controller'
import { requireLoginedHook } from '@/hooks/auth.hooks'
import {
  CreateMessageBody,
  CreateMessageBodyType,
  ListMessagesQuery,
  ListMessagesQueryType,
  MessageConversationParam,
  MessageConversationParamType,
  MessageListRes,
  MessageListResType,
  MessageRes,
  MessageResType
} from '@/schemaValidations/message.schema'
import { FastifyInstance, FastifyPluginOptions } from 'fastify'

const serializeMessage = (message: {
  id: string
  conversationId: string
  role: string
  content: string
  reasoning: string | null
  metadata: string | null
  createdAt: Date
  attachments?: any[]
}) => ({
  id: message.id,
  conversationId: message.conversationId,
  role: message.role,
  content: message.content,
  reasoning: message.reasoning,
  metadata: message.metadata,
  createdAt: message.createdAt,
  attachments: message.attachments || []
})

export default async function messageRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.addHook('preValidation', fastify.auth([requireLoginedHook]))

  // GET /api/conversations/:conversationId/messages - List messages
  fastify.get<{
    Reply: MessageListResType
    Params: MessageConversationParamType
    Querystring: ListMessagesQueryType
  }>(
    '/:conversationId/messages',
    {
      schema: {
        params: MessageConversationParam,
        querystring: ListMessagesQuery,
        response: {
          200: MessageListRes
        }
      }
    },
    async (request, reply) => {
      const accountId = request.account!.userId
      const result = await listMessagesController(request.params.conversationId, accountId, request.query)
      reply.send({
        data: result.messages.map(serializeMessage) as MessageListResType['data'],
        message: 'Get message list successfully'
      })
    }
  )

  // POST /api/conversations/:conversationId/messages - Create user message
  fastify.post<{
    Reply: MessageResType
    Params: MessageConversationParamType
    Body: CreateMessageBodyType
  }>(
    '/:conversationId/messages',
    {
      schema: {
        params: MessageConversationParam,
        body: CreateMessageBody,
        response: {
          201: MessageRes
        }
      }
    },
    async (request, reply) => {
      const accountId = request.account!.userId
      const message = await createMessageController(request.params.conversationId, accountId, request.body)
      reply.code(201).send({
        data: serializeMessage(message) as MessageResType['data'],
        message: 'Create message successfully'
      })
    }
  )
}
