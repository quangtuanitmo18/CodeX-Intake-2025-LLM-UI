import prisma from '../database'

export const conversationRepository = {
  /**
   * Find conversations by account ID with pagination and search
   */
  async findByAccountId(
    accountId: number,
    options: { limit?: number; offset?: number; search?: string; projectId?: string } = {}
  ) {
    const { limit = 20, offset = 0, search = '', projectId } = options

    const where: any = {
      accountId,
      deletedAt: null
    }

    if (projectId !== undefined) {
      // If projectId is "null" or "standalone" (string), filter for standalone conversations (projectId is null)
      if (projectId === 'null' || projectId === 'standalone') {
        where.projectId = null
      } else {
        where.projectId = projectId
      }
    }

    // Add search filter if provided
    // Note: SQLite doesn't support 'mode: insensitive', but contains is case-insensitive by default for text fields
    if (search) {
      where.OR = [
        { title: { contains: search } },
        {
          messages: {
            some: {
              content: { contains: search }
            }
          }
        }
      ]
    }

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          _count: { select: { messages: true } },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: { content: true, createdAt: true }
          }
        }
      }),
      prisma.conversation.count({ where })
    ])

    return { conversations, total }
  },

  /**
   * Find conversation by ID and verify ownership
   */
  async findById(id: string, accountId: number) {
    return prisma.conversation.findFirst({
      where: { id, accountId, deletedAt: null }
    })
  },

  /**
   * Create new conversation
   */
  async create(data: { accountId: number; title?: string; model?: string; projectId?: string }) {
    return prisma.conversation.create({
      data: {
        accountId: data.accountId,
        title: data.title || null,
        model: data.model || 'openai/gpt-5-mini',
        projectId: data.projectId || null
      }
    })
  },

  /**
   * Update conversation (title only for MVP)
   */
  async update(id: string, accountId: number, data: { title?: string }) {
    return prisma.conversation.updateMany({
      where: { id, accountId, deletedAt: null },
      data
    })
  },

  /**
   * Soft delete conversation
   */
  async softDelete(id: string, accountId: number) {
    return prisma.conversation.updateMany({
      where: { id, accountId, deletedAt: null },
      data: { deletedAt: new Date() }
    })
  },

  async moveToProject(accountId: number, fromProjectId: string, toProjectId: string) {
    return prisma.conversation.updateMany({
      where: { accountId, projectId: fromProjectId, deletedAt: null },
      data: { projectId: toProjectId }
    })
  },

  async moveConversation(accountId: number, conversationId: string, projectId: string | null) {
    return prisma.conversation.updateMany({
      where: { id: conversationId, accountId, deletedAt: null },
      data: { projectId }
    })
  }
}
