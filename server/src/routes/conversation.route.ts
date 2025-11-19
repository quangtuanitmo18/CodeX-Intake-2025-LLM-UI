import {
  createConversationController,
  deleteConversationController,
  exportConversationController,
  getConversationController,
  listConversationsController,
  updateConversationController,
  updateConversationProjectController
} from '@/controllers/conversation.controller'
import { requireLoginedHook } from '@/hooks/auth.hooks'
import { MessageRes, MessageResType } from '@/schemaValidations/common.schema'
import {
  ConversationIdParam,
  ConversationIdParamType,
  ConversationListRes,
  ConversationListResType,
  ConversationRes,
  ConversationResType,
  CreateConversationBody,
  CreateConversationBodyType,
  ExportConversationQuery,
  ExportConversationQueryType,
  ListConversationsQuery,
  ListConversationsQueryType,
  UpdateConversationBody,
  UpdateConversationBodyType,
  UpdateConversationProjectBody,
  UpdateConversationProjectBodyType
} from '@/schemaValidations/conversation.schema'
import { FastifyInstance, FastifyPluginOptions } from 'fastify'

const serializeConversation = (conversation: {
  id: string
  accountId: number
  projectId: string | null
  title: string | null
  model: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}) => ({
  id: conversation.id,
  accountId: conversation.accountId,
  projectId: conversation.projectId,
  title: conversation.title,
  model: conversation.model,
  createdAt: conversation.createdAt,
  updatedAt: conversation.updatedAt,
  deletedAt: conversation.deletedAt
})

export default async function conversationRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.addHook('preValidation', fastify.auth([requireLoginedHook]))

  // GET /api/conversations - List conversations
  fastify.get<{ Reply: ConversationListResType; Querystring: ListConversationsQueryType }>(
    '/',
    {
      schema: {
        querystring: ListConversationsQuery,
        response: {
          200: ConversationListRes
        }
      }
    },
    async (request, reply) => {
      const accountId = request.account!.userId
      const result = await listConversationsController(accountId, request.query)
      reply.send({
        data: result.conversations.map(serializeConversation) as ConversationListResType['data'],
        message: 'Get conversation list successfully'
      })
    }
  )

  // POST /api/conversations - Create conversation
  fastify.post<{ Reply: ConversationResType; Body: CreateConversationBodyType }>(
    '/',
    {
      schema: {
        body: CreateConversationBody,
        response: {
          201: ConversationRes
        }
      }
    },
    async (request, reply) => {
      const accountId = request.account!.userId
      const conversation = await createConversationController(accountId, request.body)
      reply.code(201).send({
        data: serializeConversation(conversation) as ConversationResType['data'],
        message: 'Create conversation successfully'
      })
    }
  )

  // GET /api/conversations/:id - Get single conversation
  fastify.get<{ Reply: ConversationResType; Params: ConversationIdParamType }>(
    '/:id',
    {
      schema: {
        params: ConversationIdParam,
        response: {
          200: ConversationRes
        }
      }
    },
    async (request, reply) => {
      const accountId = request.account!.userId
      const conversation = await getConversationController(request.params.id, accountId)
      reply.send({
        data: serializeConversation(conversation) as ConversationResType['data'],
        message: 'Get conversation successfully'
      })
    }
  )

  // PATCH /api/conversations/:id - Update conversation title
  fastify.patch<{ Reply: ConversationResType; Params: ConversationIdParamType; Body: UpdateConversationBodyType }>(
    '/:id',
    {
      schema: {
        params: ConversationIdParam,
        body: UpdateConversationBody,
        response: {
          200: ConversationRes
        }
      }
    },
    async (request, reply) => {
      const accountId = request.account!.userId
      const conversation = await updateConversationController(request.params.id, accountId, request.body)
      reply.send({
        data: serializeConversation(conversation) as ConversationResType['data'],
        message: 'Update conversation successfully'
      })
    }
  )

  // PATCH /api/conversations/:id/project - Move conversation between projects
  fastify.patch<{
    Reply: ConversationResType
    Params: ConversationIdParamType
    Body: UpdateConversationProjectBodyType
  }>(
    '/:id/project',
    {
      schema: {
        params: ConversationIdParam,
        body: UpdateConversationProjectBody,
        response: {
          200: ConversationRes
        }
      }
    },
    async (request, reply) => {
      const accountId = request.account!.userId
      const conversation = await updateConversationProjectController(request.params.id, accountId, request.body)
      reply.send({
        data: serializeConversation(conversation) as ConversationResType['data'],
        message: 'Move conversation successfully'
      })
    }
  )

  // DELETE /api/conversations/:id - Delete conversation
  fastify.delete<{ Reply: MessageResType; Params: ConversationIdParamType }>(
    '/:id',
    {
      schema: {
        params: ConversationIdParam,
        response: {
          200: MessageRes
        }
      }
    },
    async (request, reply) => {
      const accountId = request.account!.userId
      await deleteConversationController(request.params.id, accountId)
      reply.send({
        message: 'Delete conversation successfully'
      })
    }
  )

  // GET /api/conversations/:id/export - Export conversation
  fastify.get<{ Params: ConversationIdParamType; Querystring: ExportConversationQueryType }>(
    '/:id/export',
    {
      schema: {
        params: ConversationIdParam,
        querystring: ExportConversationQuery
      }
    },
    async (request, reply) => {
      const accountId = request.account!.userId
      const data = await exportConversationController(request.params.id, accountId, request.query)

      // Get conversation title for filename
      const conversation = await getConversationController(request.params.id, accountId)
      const title = conversation.title || 'conversation'
      const safeTitle = title.replace(/[^a-z0-9]/gi, '_').substring(0, 50)

      if (request.query.format === 'markdown') {
        reply
          .header('Content-Type', 'text/markdown; charset=utf-8')
          .header('Content-Disposition', `attachment; filename="${safeTitle}.md"`)
          .send(data)
      } else {
        reply
          .header('Content-Type', 'application/json; charset=utf-8')
          .header('Content-Disposition', `attachment; filename="${safeTitle}.json"`)
          .send(data)
      }
    }
  )
}
