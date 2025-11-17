import http from '@/lib/http'

const conversationApiRequest = {
  list: (params?: { limit?: number; offset?: number; search?: string }) =>
    http.get<{
      data: {
        id: string
        accountId: number
        title: string | null
        model: string
        createdAt: string
        updatedAt: string
        deletedAt: string | null
      }[]
      message: string
    }>('/api/conversations', { params }),

  get: (id: string) =>
    http.get<{
      data: {
        id: string
        accountId: number
        title: string | null
        model: string
        createdAt: string
        updatedAt: string
        deletedAt: string | null
      }
      message: string
    }>(`/api/conversations/${id}`),

  create: (body: { title?: string; model?: string }) =>
    http.post<{
      data: {
        id: string
        accountId: number
        title: string | null
        model: string
        createdAt: string
        updatedAt: string
        deletedAt: string | null
      }
      message: string
    }>('/api/conversations', body),

  updateTitle: (id: string, body: { title: string }) =>
    http.patch<{
      data: {
        id: string
        accountId: number
        title: string | null
        model: string
        createdAt: string
        updatedAt: string
        deletedAt: string | null
      }
      message: string
    }>(`/api/conversations/${id}`, body),

  delete: (id: string) => http.delete<{ message: string }>(`/api/conversations/${id}`),

  exportConversation: (id: string, format: 'json' | 'markdown') =>
    http.get<any>(`/api/conversations/${id}/export`, { params: { format } }),

  getMessages: (conversationId: string, params?: { limit?: number; offset?: number }) =>
    http.get<{
      data: {
        id: string
        conversationId: string
        role: 'user' | 'assistant'
        content: string
        reasoning: string | null
        metadata: string | null
        createdAt: string
        attachments: {
          id: string
          messageId: string
          fileUrl: string
          fileName: string
          fileType: string
          fileSize: number
          createdAt: string
        }[]
      }[]
      message: string
    }>(`/api/conversations/${conversationId}/messages`, { params }),

  createMessage: (
    conversationId: string,
    body: {
      content: string
      attachments?: {
        fileUrl: string
        fileName: string
        fileType: string
        fileSize: number
      }[]
    }
  ) =>
    http.post<{
      data: {
        id: string
        conversationId: string
        role: 'user' | 'assistant'
        content: string
        reasoning: string | null
        metadata: string | null
        createdAt: string
        attachments: {
          id: string
          messageId: string
          fileUrl: string
          fileName: string
          fileType: string
          fileSize: number
          createdAt: string
        }[]
      }
      message: string
    }>(`/api/conversations/${conversationId}/messages`, body),

  uploadAttachment: (conversationId: string, messageId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('conversationId', conversationId)
    formData.append('messageId', messageId)

    return http.post<{
      data: {
        fileUrl: string
        fileName: string
        fileType: string
        fileSize: number
      }
      message: string
    }>('/api/media/upload-attachment', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

export default conversationApiRequest
