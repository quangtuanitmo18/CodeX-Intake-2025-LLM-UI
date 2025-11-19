'use client'

import { Loader2, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ZodError } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import {
  useDeleteConversation,
  useMoveConversationProject,
  useUpdateConversation,
} from '@/queries/useConversation'
import { useProjects } from '@/queries/useProject'
import { UpdateConversationBody } from '@/schemaValidations/conversation.schema'

interface ConversationItemProps {
  conversation: {
    id: string
    projectId?: string | null
    title: string | null
    updatedAt: string
    createdAt: string
  }
  isActive: boolean
  onClick: () => void
}

export function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(conversation.title || '')
  const [showMenu, setShowMenu] = useState(false)
  const [isSelectingProject, setIsSelectingProject] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const updateMutation = useUpdateConversation()
  const deleteMutation = useDeleteConversation()
  const moveProjectMutation = useMoveConversationProject()
  const { data: projectsData, isLoading: isLoadingProjects } = useProjects()

  const projects = projectsData?.payload?.data || []

  const closeMenu = () => {
    setShowMenu(false)
    setIsSelectingProject(false)
  }

  const navigateToConversation = (projectId: string | null) => {
    if (projectId) {
      router.push(`/llm/projects/${projectId}/conversation/${conversation.id}`)
    } else {
      router.push(`/llm/${conversation.id}`)
    }
  }

  const handleSaveTitle = async () => {
    const trimmedTitle = editTitle.trim()
    if (!trimmedTitle) return

    try {
      // Validate with Zod
      UpdateConversationBody.parse({ title: trimmedTitle })
      setValidationError(null)

      await updateMutation.mutateAsync({ id: conversation.id, title: trimmedTitle })
      setIsEditing(false)
      toast({
        title: 'Conversation renamed',
        description: trimmedTitle,
      })
    } catch (error) {
      if (error instanceof ZodError) {
        setValidationError(error.errors[0]?.message || 'Invalid title')
      } else {
        console.error('Failed to update title:', error)
        setValidationError('Failed to update title')
        toast({
          title: 'Rename failed',
          description: 'Could not update conversation title.',
          variant: 'destructive',
        })
      }
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(conversation.id)
      toast({
        title: 'Conversation deleted',
        description: 'You can always start a new chat.',
      })
      if (isActive) {
        if (conversation.projectId) {
          router.push(`/llm/projects/${conversation.projectId}`)
        } else {
          router.push('/llm')
        }
      }
      closeMenu()
    } catch (error) {
      console.error('Failed to delete conversation:', error)
      toast({
        title: 'Delete failed',
        description: 'Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleMoveConversation = async (projectId: string | null) => {
    try {
      const result = await moveProjectMutation.mutateAsync({
        id: conversation.id,
        projectId,
      })
      const updatedConversation = result.payload.data
      if (isActive) {
        navigateToConversation(updatedConversation.projectId ?? null)
      }
      setIsSelectingProject(false)
      setShowMenu(false)
      toast({
        title: projectId ? 'Conversation moved' : 'Conversation is standalone',
        description: projectId
          ? 'Chat is now inside the selected project.'
          : 'Chat is back in All chats.',
      })
    } catch (error) {
      console.error('Failed to move conversation:', error)
      toast({
        title: 'Move failed',
        description: 'Could not move conversation.',
        variant: 'destructive',
      })
    }
  }

  const displayTitle = conversation.title || 'New Chat'

  return (
    <div
      className={cn(
        'group relative rounded-xl border border-transparent px-2 py-1.5 transition-colors hover:border-white/10 hover:bg-white/5',
        isActive && 'border-emerald-500/30 bg-emerald-500/10'
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 cursor-pointer" onClick={onClick}>
          {isEditing ? (
            <div className="w-full">
              <Input
                type="text"
                value={editTitle}
                onChange={(e) => {
                  setEditTitle(e.target.value)
                  setValidationError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle()
                  if (e.key === 'Escape') {
                    setIsEditing(false)
                    setValidationError(null)
                  }
                }}
                onBlur={handleSaveTitle}
                className={cn(
                  'h-7 border-white/10 bg-white/5 text-sm text-white',
                  validationError && 'border-red-500/50'
                )}
                autoFocus
              />
              {validationError && <p className="mt-1 text-xs text-red-400">{validationError}</p>}
            </div>
          ) : (
            <p className="truncate text-sm font-medium text-white">{displayTitle}</p>
          )}
        </div>

        <div className="relative flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMenu((prev) => !prev)}
            className={cn(
              'h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100',
              showMenu && 'opacity-100'
            )}
          >
            <MoreVertical className="h-3.5 w-3.5 text-white/60" />
          </Button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={closeMenu} />
              <div className="absolute right-0 top-8 z-20 w-64 rounded-lg border border-white/10 bg-[#040714] p-2 shadow-xl">
                <button
                  onClick={() => {
                    setIsEditing(true)
                    closeMenu()
                  }}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Title
                </button>
                <button
                  onClick={() => setIsSelectingProject((prev) => !prev)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-white/80 hover:bg-white/10',
                    isSelectingProject && 'bg-white/10'
                  )}
                >
                  <Loader2
                    className={cn(
                      'h-4 w-4 text-white/60',
                      moveProjectMutation.isPending && 'animate-spin'
                    )}
                  />
                  Move to project
                </button>
                <button
                  onClick={() => setIsConfirmingDelete((prev) => !prev)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-red-400 hover:bg-red-500/10',
                    isConfirmingDelete && 'bg-red-500/10'
                  )}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>

                {isSelectingProject && (
                  <div className="mt-2 rounded-md border border-white/10 bg-[#01030b] p-2">
                    {isLoadingProjects ? (
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Loading projects...
                      </div>
                    ) : projects.length === 0 ? (
                      <p className="text-xs text-white/60">
                        No projects yet. Create one from the sidebar first.
                      </p>
                    ) : (
                      <div className="space-y-1 text-sm">
                        <button
                          onClick={() => handleMoveConversation(null)}
                          disabled={moveProjectMutation.isPending}
                          className={cn(
                            'flex w-full items-center justify-between rounded px-2 py-1 text-left text-white/80 hover:bg-white/10',
                            !conversation.projectId && 'bg-white/10'
                          )}
                        >
                          <span>All chats</span>
                          {!conversation.projectId && (
                            <span className="text-xs text-emerald-300">Current</span>
                          )}
                        </button>
                        <div className="max-h-48 space-y-1 overflow-y-auto">
                          {projects.map((project: any) => (
                            <button
                              key={project.id}
                              onClick={() => handleMoveConversation(project.id)}
                              disabled={moveProjectMutation.isPending}
                              className={cn(
                                'flex w-full items-center justify-between rounded px-2 py-1 text-left text-white/80 hover:bg-white/10',
                                conversation.projectId === project.id && 'bg-white/10'
                              )}
                            >
                              <span>{project.name}</span>
                              {conversation.projectId === project.id && (
                                <span className="text-xs text-emerald-300">Current</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {isConfirmingDelete && (
                  <div className="mt-2 space-y-2 rounded-md border border-red-500/20 bg-red-500/5 p-3 text-sm text-white/80">
                    <p className="text-xs text-red-200">
                      This will permanently delete the conversation and its messages.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-red-500/80 text-xs text-white hover:bg-red-500"
                        disabled={deleteMutation.isPending}
                        onClick={handleDelete}
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Delete'
                        )}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="flex-1 text-xs text-white/80"
                        onClick={() => setIsConfirmingDelete(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
