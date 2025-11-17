import { messageRepository } from '../repositories/message.repository'
import { conversationService } from './conversation.service'

export const messageService = {
  /**
   * List messages in a conversation
   */
  async list(conversationId: string, accountId: number, filters: { limit?: number; offset?: number } = {}) {
    // Verify user owns conversation
    await conversationService.get(conversationId, accountId)
    return messageRepository.findByConversationId(conversationId, filters)
  },

  /**
   * Create user message with optional attachments
   */
  async createUserMessage(
    conversationId: string,
    accountId: number,
    content: string,
    attachmentData?: Array<{
      fileUrl: string
      fileName: string
      fileType: string
      fileSize: number
    }>
  ) {
    // Verify ownership
    await conversationService.get(conversationId, accountId)

    // Create message
    const message = await messageRepository.create({
      conversationId,
      role: 'user',
      content,
      reasoning: undefined,
      metadata: undefined
    })

    // Link attachments if provided
    if (attachmentData && attachmentData.length > 0) {
      await messageRepository.addAttachments(message.id, attachmentData)
    }

    // Auto-generate title if this is the first message
    const messageCount = await messageRepository.count(conversationId)
    if (messageCount === 1) {
      await conversationService.autoGenerateTitle(conversationId, accountId, content)
    }

    // Fetch message with attachments to return complete data
    const messages = await messageRepository.findByConversationId(conversationId, { limit: 1, offset: 0 })
    const messageWithAttachments = messages.messages.find((m: any) => m.id === message.id)

    return messageWithAttachments || message
  },

  /**
   * Create assistant message (after LLM streaming)
   */
  async createAssistantMessage(
    conversationId: string,
    accountId: number,
    content: string,
    reasoning?: string,
    metadata?: { tokens?: any; duration?: number; model?: string }
  ) {
    // Verify ownership
    await conversationService.get(conversationId, accountId)

    return messageRepository.create({
      conversationId,
      role: 'assistant',
      content,
      reasoning: reasoning || undefined,
      metadata: metadata ? JSON.stringify(metadata) : undefined
    })
  }
}
