import { conversationRepository } from '../repositories/conversation.repository'
import { messageRepository } from '../repositories/message.repository'
import { mediaService } from './media.service'

export const conversationService = {
  /**
   * List conversations for a user with pagination and search
   */
  async list(accountId: number, filters: { limit?: number; offset?: number; search?: string } = {}) {
    return conversationRepository.findByAccountId(accountId, filters)
  },

  /**
   * Get single conversation by ID
   */
  async get(id: string, accountId: number) {
    const conversation = await conversationRepository.findById(id, accountId)
    if (!conversation) {
      throw new Error('Conversation not found')
    }
    return conversation
  },

  /**
   * Create new conversation
   */
  async create(accountId: number, data: { title?: string; model?: string } = {}) {
    return conversationRepository.create({ accountId, ...data })
  },

  /**
   * Update conversation title
   */
  async updateTitle(id: string, accountId: number, title: string) {
    const conversation = await this.get(id, accountId) // Verify ownership
    await conversationRepository.update(id, accountId, { title })
    return { ...conversation, title }
  },

  /**
   * Soft delete conversation
   */
  async delete(id: string, accountId: number) {
    await this.get(id, accountId) // Verify ownership
    await conversationRepository.softDelete(id, accountId)

    // Delete all attachment files from disk
    await mediaService.deleteConversationAttachments(id)
  },

  /**
   * Auto-generate conversation title from first message
   * Truncates at word boundary to avoid cutting mid-word
   */
  async autoGenerateTitle(conversationId: string, accountId: number, firstMessage: string) {
    const trimmed = firstMessage.trim()

    if (trimmed.length === 0) {
      await conversationRepository.update(conversationId, accountId, {
        title: `New Conversation - ${new Date().toISOString()}`
      })
      return
    }

    let title = trimmed.slice(0, 50)

    // If we truncated and there's more content, break on word boundary
    if (trimmed.length > 50) {
      const lastSpaceIndex = title.lastIndexOf(' ')
      if (lastSpaceIndex > 20) {
        // Only break on space if we have at least 20 chars
        title = title.slice(0, lastSpaceIndex)
      }
      title += '...'
    }

    await conversationRepository.update(conversationId, accountId, { title })
  },

  /**
   * Export conversation to JSON format
   */
  async exportToJSON(id: string, accountId: number) {
    const conversation = await this.get(id, accountId)
    const { messages } = await messageRepository.findByConversationId(id, {
      limit: 1000
    })

    return {
      id: conversation.id,
      title: conversation.title,
      model: conversation.model,
      createdAt: conversation.createdAt,
      messages: messages.map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        reasoning: m.reasoning,
        metadata: m.metadata ? JSON.parse(m.metadata) : null,
        createdAt: m.createdAt,
        attachments: m.attachments || []
      }))
    }
  },

  /**
   * Export conversation to Markdown format
   */
  async exportToMarkdown(id: string, accountId: number) {
    const data = await this.exportToJSON(id, accountId)

    let md = `# ${data.title || 'Untitled Conversation'}\n\n`
    md += `**Model:** ${data.model}  \n`
    md += `**Created:** ${new Date(data.createdAt).toLocaleString()}\n\n`
    md += `---\n\n`

    data.messages.forEach((msg: any, idx: number) => {
      md += `## Message ${idx + 1} (${msg.role})\n`
      md += `*${new Date(msg.createdAt).toLocaleString()}*\n\n`
      md += `${msg.content}\n\n`

      if (msg.reasoning) {
        md += `<details>\n<summary>Reasoning</summary>\n\n${msg.reasoning}\n\n</details>\n\n`
      }

      if (msg.attachments && msg.attachments.length > 0) {
        md += `**Attachments:**\n`
        msg.attachments.forEach((att: any) => {
          md += `- [${att.fileName}](${att.fileUrl})\n`
        })
        md += `\n`
      }

      md += `---\n\n`
    })

    return md
  }
}
