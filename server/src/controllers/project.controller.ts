import { CreateConversationBodyType } from '@/schemaValidations/conversation.schema'
import {
  CreateProjectBodyType,
  ListProjectsQueryType,
  ProjectIdParamType,
  UpdateProjectBodyType
} from '@/schemaValidations/project.schema'
import { projectService } from '@/services/project.service'

export const listProjectsController = async (accountId: number, query: ListProjectsQueryType) =>
  projectService.list(accountId, { includeCounts: query.includeCounts })

export const createProjectController = async (accountId: number, body: CreateProjectBodyType) =>
  projectService.create(accountId, body)

export const updateProjectController = async (
  params: ProjectIdParamType,
  accountId: number,
  body: UpdateProjectBodyType
) => projectService.update(params.id, accountId, body)

export const deleteProjectController = async (params: ProjectIdParamType, accountId: number) =>
  projectService.delete(params.id, accountId)

export const createProjectConversationController = async (
  params: ProjectIdParamType,
  accountId: number,
  body: CreateConversationBodyType
) => projectService.createConversation(accountId, params.id, body)
