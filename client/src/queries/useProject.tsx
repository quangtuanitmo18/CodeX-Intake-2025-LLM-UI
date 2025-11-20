'use client'

import projectApiRequest from '@/apiRequests/project'
import { CreateProjectBodyType, UpdateProjectBodyType } from '@/schemaValidations/project.schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useProjects = (params?: { includeCounts?: boolean }) => {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectApiRequest.list(params),
  })
}

export const useCreateProject = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateProjectBodyType) => projectApiRequest.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export const useUpdateProject = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, lastOpenedAt, ...rest }: UpdateProjectBodyType & { id: string }) => {
      const payload: Parameters<typeof projectApiRequest.update>[1] = {
        ...rest,
        ...(lastOpenedAt ? { lastOpenedAt: new Date(lastOpenedAt) } : {}),
      }

      return projectApiRequest.update(id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export const useDeleteProject = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => projectApiRequest.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export const useCreateProjectConversation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      projectId,
      title,
      model,
    }: {
      projectId: string
      title?: string
      model?: string
    }) => projectApiRequest.createConversation(projectId, { title, model }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}
