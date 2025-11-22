import { conversationRepository } from '../repositories/conversation.repository'
import { projectRepository } from '../repositories/project.repository'

const DEFAULT_PROJECT_NAME = 'General'

async function ensureDefaultProject(accountId: number) {
  const existing = await projectRepository.listByAccount(accountId)
  const defaultProject = existing.find(
    (project: any) => project.name === DEFAULT_PROJECT_NAME && project.deletedAt === null
  )

  if (defaultProject) {
    return defaultProject
  }

  return projectRepository.create(accountId, {
    name: DEFAULT_PROJECT_NAME,
    description: 'Default project'
  })
}

async function getProjectOrThrow(id: string, accountId: number) {
  const project = await projectRepository.findById(id, accountId)
  if (!project) {
    throw new Error('Project not found')
  }
  return project
}

export const projectService = {
  list(accountId: number, options: { includeCounts?: boolean } = {}) {
    return projectRepository.listByAccount(accountId, options)
  },

  create(accountId: number, data: { name: string; description?: string }) {
    return projectRepository.create(accountId, data)
  },

  async update(
    id: string,
    accountId: number,
    data: { name?: string; description?: string | null; lastOpenedAt?: Date }
  ) {
    await getProjectOrThrow(id, accountId)
    await projectRepository.update(id, accountId, data)
    return projectRepository.findById(id, accountId)
  },

  async delete(id: string, accountId: number) {
    const project = await getProjectOrThrow(id, accountId)
    const fallback = await ensureDefaultProject(accountId)

    if (project.id === fallback.id) {
      throw new Error('Default project cannot be deleted')
    }

    // Reassign conversations to fallback project
    await conversationRepository.moveToProject(accountId, project.id, fallback.id)

    await projectRepository.softDelete(id, accountId)

    return { deletedId: id, reassignedTo: fallback.id }
  },

  async createConversation(accountId: number, projectId: string, data: { title?: string; model?: string }) {
    await getProjectOrThrow(projectId, accountId)
    return conversationRepository.create({ accountId, projectId, ...data })
  }
}
