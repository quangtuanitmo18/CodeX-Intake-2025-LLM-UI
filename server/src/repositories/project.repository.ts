import prisma from '../database'

export const projectRepository = {
  async listByAccount(accountId: number, options: { includeCounts?: boolean } = {}) {
    const { includeCounts = false } = options

    const projects = await prisma.project.findMany({
      where: { accountId, deletedAt: null },
      orderBy: { updatedAt: 'desc' }
    })

    if (!includeCounts) {
      return projects
    }

    const counts = await prisma.conversation.groupBy({
      by: ['projectId'],
      where: {
        accountId,
        deletedAt: null,
        projectId: { not: null }
      },
      _count: { _all: true }
    })

    const countsMap = new Map<string, number>()
    counts.forEach((entry) => {
      if (entry.projectId) {
        countsMap.set(entry.projectId, entry._count._all)
      }
    })

    return projects.map((project) => ({
      ...project,
      stats: {
        conversations: countsMap.get(project.id) ?? 0
      }
    }))
  },

  async create(accountId: number, data: { name: string; description?: string }) {
    return prisma.project.create({
      data: {
        accountId,
        name: data.name,
        description: data.description ?? null
      }
    })
  },

  async update(
    id: string,
    accountId: number,
    data: { name?: string; description?: string | null; lastOpenedAt?: Date }
  ) {
    return prisma.project.updateMany({
      where: { id, accountId, deletedAt: null },
      data
    })
  },

  async findById(id: string, accountId: number) {
    return prisma.project.findFirst({
      where: { id, accountId, deletedAt: null }
    })
  },

  async softDelete(id: string, accountId: number) {
    return prisma.project.updateMany({
      where: { id, accountId, deletedAt: null },
      data: { deletedAt: new Date() }
    })
  }
}
