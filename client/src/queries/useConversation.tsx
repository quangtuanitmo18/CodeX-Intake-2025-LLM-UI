'use client'

import conversationApiRequest from '@/apiRequests/conversation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useConversations = (params?: {
  limit?: number
  offset?: number
  search?: string
  projectId?: string
}) => {
  return useQuery({
    queryKey: ['conversations', params],
    queryFn: () => conversationApiRequest.list(params),
  })
}

export const useConversation = (id: string | null) => {
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: () => conversationApiRequest.get(id!),
    enabled: !!id,
  })
}

export const useCreateConversation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { title?: string; model?: string; projectId?: string }) =>
      conversationApiRequest.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export const useUpdateConversation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      conversationApiRequest.updateTitle(id, { title }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['conversation', variables.id] })
    },
  })
}

export const useDeleteConversation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => conversationApiRequest.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export const useMoveConversationProject = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string | null }) =>
      conversationApiRequest.moveToProject(id, { projectId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['conversation', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export const useConversationMessages = (
  conversationId: string | null,
  params?: { limit?: number; offset?: number }
) => {
  return useQuery({
    queryKey: ['messages', conversationId, params],
    queryFn: () => conversationApiRequest.getMessages(conversationId!, params),
    enabled: !!conversationId,
  })
}

export const useCreateMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      conversationId,
      content,
      attachments,
    }: {
      conversationId: string
      content: string
      attachments?: {
        fileUrl: string
        fileName: string
        fileType: string
        fileSize: number
      }[]
    }) => conversationApiRequest.createMessage(conversationId, { content, attachments }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export const useExportConversation = () => {
  return useMutation({
    mutationFn: ({ id, format }: { id: string; format: 'json' | 'markdown' }) =>
      conversationApiRequest.exportConversation(id, format),
  })
}

export const useUploadAttachment = () => {
  return useMutation({
    mutationFn: ({
      conversationId,
      messageId,
      file,
    }: {
      conversationId: string
      messageId: string
      file: File
    }) => conversationApiRequest.uploadAttachment(conversationId, messageId, file),
  })
}
