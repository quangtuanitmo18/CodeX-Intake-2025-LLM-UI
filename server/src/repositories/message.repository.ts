import prisma from '../database'

export const messageRepository = {
  /**
   * Find messages by conversation ID with attachments
   */
  async findByConversationId(conversationId: string, options: { limit?: number; offset?: number } = {}) {
    const { limit = 50, offset = 0 } = options

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: limit,
      skip: offset,
      include: {
        attachments: true
      }
    })

    const total = await prisma.message.count({ where: { conversationId } })

    return { messages, total }
  },

  /**
   * Create new message
   */
  async create(data: { conversationId: string; role: string; content: string; reasoning?: string; metadata?: string }) {
    return prisma.message.create({
      data: {
        conversationId: data.conversationId,
        role: data.role,
        content: data.content,
        reasoning: data.reasoning || null,
        metadata: data.metadata || null
      }
    })
  },

  /**
   * Add attachments to a message
   */
  async addAttachments(
    messageId: string,
    attachments: Array<{
      fileUrl: string
      fileName: string
      fileType: string
      fileSize: number
    }>
  ) {
    return prisma.messageAttachment.createMany({
      data: attachments.map((att) => ({
        messageId,
        fileUrl: att.fileUrl,
        fileName: att.fileName,
        fileType: att.fileType,
        fileSize: att.fileSize
      }))
    })
  },

  /**
   * Count messages in a conversation
   */
  async count(conversationId: string) {
    return prisma.message.count({
      where: { conversationId }
    })
  }
}
