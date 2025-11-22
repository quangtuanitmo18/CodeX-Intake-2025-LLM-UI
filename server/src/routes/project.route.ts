import {
  createProjectController,
  createProjectConversationController,
  deleteProjectController,
  listProjectsController,
  updateProjectController
} from '@/controllers/project.controller'
import { requireLoginedHook } from '@/hooks/auth.hooks'
import { MessageRes, MessageResType } from '@/schemaValidations/common.schema'
import {
  ConversationRes,
  ConversationResType,
  CreateConversationBody,
  CreateConversationBodyType
} from '@/schemaValidations/conversation.schema'
import {
  CreateProjectBody,
  CreateProjectBodyType,
  ListProjectsQuery,
  ListProjectsQueryType,
  ProjectIdParam,
  ProjectIdParamType,
  ProjectListRes,
  ProjectListResType,
  ProjectRes,
  ProjectResType,
  UpdateProjectBody,
  UpdateProjectBodyType
} from '@/schemaValidations/project.schema'
import { FastifyInstance, FastifyPluginOptions } from 'fastify'

const serializeProject = (project: ProjectResType['data']): ProjectResType['data'] => ({
  id: project.id,
  accountId: project.accountId,
  name: project.name,
  description: project.description,
  lastOpenedAt: project.lastOpenedAt,
  createdAt: project.createdAt,
  updatedAt: project.updatedAt,
  deletedAt: project.deletedAt,
  stats: project.stats
})

export default async function projectRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.addHook('preValidation', fastify.auth([requireLoginedHook]))

  // GET /api/projects
  fastify.get<{ Reply: ProjectListResType; Querystring: ListProjectsQueryType }>(
    '/',
    {
      schema: {
        querystring: ListProjectsQuery,
        response: {
          200: ProjectListRes
        }
      }
    },
    async (request, reply) => {
      const accountId = request.account!.userId
      const projects = await listProjectsController(accountId, request.query)
      reply.send({
        data: projects.map((project: any) => serializeProject(project as ProjectResType['data'])),
        message: 'List projects successfully'
      })
    }
  )

  // POST /api/projects
  fastify.post<{ Reply: ProjectResType; Body: CreateProjectBodyType }>(
    '/',
    {
      schema: {
        body: CreateProjectBody,
        response: {
          201: ProjectRes
        }
      }
    },
    async (request, reply) => {
      const accountId = request.account!.userId
      const project = await createProjectController(accountId, request.body)
      reply.code(201).send({
        data: serializeProject(project as ProjectResType['data']),
        message: 'Create project successfully'
      })
    }
  )

  // PATCH /api/projects/:id
  fastify.patch<{ Reply: ProjectResType; Params: ProjectIdParamType; Body: UpdateProjectBodyType }>(
    '/:id',
    {
      schema: {
        params: ProjectIdParam,
        body: UpdateProjectBody,
        response: {
          200: ProjectRes
        }
      }
    },
    async (request, reply) => {
      const accountId = request.account!.userId
      const project = await updateProjectController(request.params, accountId, request.body)
      reply.send({
        data: serializeProject(project as ProjectResType['data']),
        message: 'Update project successfully'
      })
    }
  )

  // DELETE /api/projects/:id
  fastify.delete<{ Reply: MessageResType; Params: ProjectIdParamType }>(
    '/:id',
    {
      schema: {
        params: ProjectIdParam,
        response: {
          200: MessageRes
        }
      }
    },
    async (request, reply) => {
      const accountId = request.account!.userId
      await deleteProjectController(request.params, accountId)
      reply.send({
        message: 'Delete project successfully'
      })
    }
  )

  // POST /api/projects/:id/conversations
  fastify.post<{
    Reply: ConversationResType
    Params: ProjectIdParamType
    Body: CreateConversationBodyType
  }>(
    '/:id/conversations',
    {
      schema: {
        params: ProjectIdParam,
        body: CreateConversationBody,
        response: {
          201: ConversationRes
        }
      }
    },
    async (request, reply) => {
      const accountId = request.account!.userId
      const conversation = await createProjectConversationController(request.params, accountId, request.body)
      reply.code(201).send({
        data: {
          id: conversation.id,
          accountId: conversation.accountId,
          projectId: conversation.projectId,
          title: conversation.title,
          model: conversation.model ?? '',
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
          deletedAt: conversation.deletedAt
        },
        message: 'Create conversation under project successfully'
      })
    }
  )
}
