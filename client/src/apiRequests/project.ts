import http from '@/lib/http'
import { ConversationResType } from '@/schemaValidations/conversation.schema'
import { ProjectListResType, ProjectResType } from '@/schemaValidations/project.schema'

const projectApiRequest = {
  list: (params?: { includeCounts?: boolean }) =>
    http.get<ProjectListResType>('/api/projects', {
      params,
    }),

  create: (body: { name: string; description?: string }) =>
    http.post<ProjectResType>('/api/projects', body),

  update: (id: string, body: { name?: string; description?: string | null; lastOpenedAt?: Date }) =>
    http.patch<ProjectResType>(`/api/projects/${id}`, body),

  delete: (id: string) => http.delete<{ message: string }>(`/api/projects/${id}`),

  createConversation: (projectId: string, body: { title?: string; model?: string }) =>
    http.post<ConversationResType>(`/api/projects/${projectId}/conversations`, body),
}

export default projectApiRequest
