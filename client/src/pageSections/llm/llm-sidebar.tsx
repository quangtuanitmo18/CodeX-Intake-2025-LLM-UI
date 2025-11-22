'use client'

import {
  ChevronDown,
  Folder,
  FolderPlus,
  Loader2,
  MessageSquarePlus,
  MoreVertical,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { ZodError } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { useConversations, useCreateConversation } from '@/queries/useConversation'
import {
  useCreateProjectConversation,
  useDeleteProject,
  useProjects,
  useUpdateProject,
} from '@/queries/useProject'
import { CreateConversationBody } from '@/schemaValidations/conversation.schema'

import { ConversationItem } from './conversation-item'
import { ProjectFormModal } from './project-form-modal'
import { UserProfileMenu } from './user-profile-menu'

interface LLMSidebarProps {
  activeConversationId?: string
  activeProjectId?: string
}

interface ProjectItemProps {
  project: any
  isExpanded: boolean
  onToggleExpand: () => void
  activeConversationId?: string
  activeProjectId?: string
}

function ProjectItem({
  project,
  isExpanded,
  onToggleExpand,
  activeConversationId,
  activeProjectId,
}: ProjectItemProps) {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(project.name)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  const { data: projectConversationsData, isLoading: isLoadingProjectChats } = useConversations({
    limit: 50,
    offset: 0,
    projectId: project.id,
  })

  const updateProjectMutation = useUpdateProject()
  const deleteProjectMutation = useDeleteProject()
  const createProjectChatMutation = useCreateProjectConversation()

  const projectConversations = projectConversationsData?.payload?.data || []
  const isActive = project.id === activeProjectId

  const resolveConversationPath = (conversation: { id: string; projectId?: string | null }) =>
    conversation.projectId
      ? `/llm/project/${conversation.projectId}/conversation/${conversation.id}`
      : `/llm/conversation/${conversation.id}`

  const handleSaveName = async () => {
    const trimmed = editName.trim()
    if (!trimmed) return
    try {
      await updateProjectMutation.mutateAsync({ id: project.id, name: trimmed })
      setIsEditing(false)
      setShowMenu(false)
      toast({
        title: 'Project renamed',
        description: trimmed,
      })
    } catch (error) {
      console.error('Failed to update project:', error)
      toast({
        title: 'Rename failed',
        description: 'Could not update project name.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async () => {
    try {
      await deleteProjectMutation.mutateAsync(project.id)
      setShowMenu(false)
      toast({
        title: 'Project deleted',
        description: 'All chats have been moved to General project.',
      })
      if (isActive) {
        router.push('/llm')
      }
    } catch (error) {
      console.error('Failed to delete project:', error)
      toast({
        title: 'Delete failed',
        description: 'Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleAddChat = async () => {
    try {
      const result = await createProjectChatMutation.mutateAsync({ projectId: project.id })
      const conversation = result.payload.data
      setShowMenu(false)
      router.push(resolveConversationPath(conversation))
      toast({
        title: 'Chat created',
        description: 'New chat added to project.',
      })
    } catch (error) {
      console.error('Failed to create chat:', error)
      toast({
        title: 'Create failed',
        description: 'Could not create chat.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-1">
      <div
        className={cn(
          'group relative flex w-full items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-left text-sm text-white/80 transition hover:bg-white/5',
          isActive && 'bg-white/10 text-white'
        )}
      >
        <button onClick={onToggleExpand} className="flex flex-1 items-center gap-2">
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 text-white/60 transition-transform',
              isExpanded ? 'rotate-0' : '-rotate-90'
            )}
          />
          <Folder className="h-4 w-4 text-white/70" />
          {isEditing ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName()
                if (e.key === 'Escape') {
                  setIsEditing(false)
                  setEditName(project.name)
                }
              }}
              onBlur={handleSaveName}
              className="h-6 border-white/10 bg-white/5 text-xs text-white"
              autoFocus
            />
          ) : (
            <span className="truncate font-medium">{project.name}</span>
          )}
        </button>

        <div className="relative">
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
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-8 z-20 w-56 rounded-lg border border-white/10 bg-[#040714] p-2 shadow-xl">
                <button
                  onClick={() => {
                    setIsEditing(true)
                    setShowMenu(false)
                  }}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={handleAddChat}
                  disabled={createProjectChatMutation.isPending}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                >
                  {createProjectChatMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquarePlus className="h-4 w-4" />
                  )}
                  Add chat
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

                {isConfirmingDelete && (
                  <div className="mt-2 space-y-2 rounded-md border border-red-500/20 bg-red-500/5 p-3 text-sm text-white/80">
                    <p className="text-xs text-red-200">
                      This will delete the project. All chats will be moved to General project.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-red-500/80 text-xs text-white hover:bg-red-500"
                        disabled={deleteProjectMutation.isPending}
                        onClick={handleDelete}
                      >
                        {deleteProjectMutation.isPending ? (
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

      {isExpanded && (
        <div className="ml-6 space-y-2 border-l border-white/10 pl-2">
          {isLoadingProjectChats ? (
            <div className="flex items-center justify-center py-2 text-xs text-white/50">
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
              Loading...
            </div>
          ) : projectConversations.length === 0 ? (
            <div className="px-2 py-1.5 text-xs text-white/50">No chats yet</div>
          ) : (
            projectConversations.map((conversation: any) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === activeConversationId}
                onClick={() => router.push(resolveConversationPath(conversation))}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

export function LLMSidebar({ activeConversationId, activeProjectId }: LLMSidebarProps) {
  const router = useRouter()
  const [projectsOpen, setProjectsOpen] = useState(true)
  const [chatsOpen, setChatsOpen] = useState(true)
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [limit] = useState(20)
  const [offset, setOffset] = useState(0)

  // Debounce search input (500ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setOffset(0) // Reset offset when search changes
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  // Auto-expand active project
  useEffect(() => {
    if (activeProjectId) {
      setExpandedProjects((prev) => new Set(prev).add(activeProjectId))
    }
  }, [activeProjectId])

  const projectQueryParams = useMemo(() => ({ includeCounts: true }), [])
  const { data: projectsData, isLoading: isLoadingProjects } = useProjects(projectQueryParams)

  // Only fetch standalone conversations (projectId = null)
  // Use debouncedSearch for API calls to avoid too many requests
  const { data: conversationsData, isLoading: isLoadingConversations } = useConversations({
    limit,
    offset,
    search: debouncedSearch,
    projectId: 'standalone', // Filter for standalone chats (projectId is null)
  })
  const createConversationMutation = useCreateConversation()

  const projects = projectsData?.payload?.data || []
  const conversations = conversationsData?.payload?.data || []

  const handleProjectCreated = (projectId: string) => {
    setExpandedProjects((prev) => new Set(prev).add(projectId))
    router.push(`/llm/project/${projectId}`)
  }

  const toggleProjectExpand = (projectId: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev)
      if (next.has(projectId)) {
        next.delete(projectId)
      } else {
        next.add(projectId)
      }
      return next
    })
  }

  const resolveConversationPath = (conversation: { id: string; projectId?: string | null }) =>
    conversation.projectId
      ? `/llm/project/${conversation.projectId}/conversation/${conversation.id}`
      : `/llm/conversation/${conversation.id}`

  const handleNewChat = async () => {
    try {
      CreateConversationBody.parse({})
      const result = await createConversationMutation.mutateAsync({})
      const conversation = result.payload.data
      router.push(resolveConversationPath(conversation))
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('Validation error:', error.errors)
      } else {
        console.error('Failed to create conversation:', error)
      }
    }
  }

  const handleLoadMore = () => {
    setOffset((prev) => prev + limit)
  }

  return (
    <aside className="flex h-full w-full flex-col border-r border-white/10 bg-white/5 backdrop-blur-sm md:w-80">
      <div className="border-b border-white/10 p-4">
        <Button
          onClick={handleNewChat}
          disabled={createConversationMutation.isPending}
          className="w-full gap-2 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Projects Section */}
        <section className="border-b border-white/5 p-4">
          <header
            className="flex cursor-pointer items-center justify-between text-sm font-semibold text-white"
            onClick={() => setProjectsOpen((prev) => !prev)}
          >
            <span>Projects</span>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsProjectModalOpen(true)
                  setProjectsOpen(true)
                }}
                className="rounded-full border border-white/15 p-1 text-white/70 transition hover:bg-white/10"
              >
                <FolderPlus className="h-4 w-4" />
              </button>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-white/70 transition-transform',
                  projectsOpen ? 'rotate-0' : '-rotate-90'
                )}
              />
            </div>
          </header>

          {projectsOpen && (
            <div className="mt-3 space-y-1">
              {isLoadingProjects ? (
                <div className="flex items-center justify-center py-4 text-xs text-white/60">
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Loading projects...
                </div>
              ) : projects.length === 0 ? (
                <div className="rounded-lg border border-dashed border-white/15 p-4 text-center text-xs text-white/60">
                  No projects yet. Use the + button to create one.
                </div>
              ) : (
                <div className="space-y-1">
                  {projects.map((project: any) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      isExpanded={expandedProjects.has(project.id)}
                      onToggleExpand={() => toggleProjectExpand(project.id)}
                      activeConversationId={activeConversationId}
                      activeProjectId={activeProjectId}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Chats Section - Only standalone chats */}
        <section className="p-4">
          <header
            className="flex cursor-pointer items-center justify-between text-sm font-semibold text-white"
            onClick={() => setChatsOpen((prev) => !prev)}
          >
            <span>Chats</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-white/70 transition-transform',
                chatsOpen ? 'rotate-0' : '-rotate-90'
              )}
            />
          </header>

          {chatsOpen && (
            <div className="mt-3 space-y-3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search chats..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-white/10 bg-white/5 pl-10 pr-10 text-sm text-white placeholder:text-white/40"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {isLoadingConversations ? (
                <div className="flex items-center justify-center py-6 text-sm text-white/60">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading chats...
                </div>
              ) : conversations.length === 0 ? (
                <div className="rounded-lg border border-dashed border-white/15 p-4 text-center text-xs text-white/60">
                  {search ? 'No conversations found.' : 'No standalone chats yet.'}
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conversation: any) => (
                    <ConversationItem
                      key={conversation.id}
                      conversation={conversation}
                      isActive={conversation.id === activeConversationId}
                      onClick={() => router.push(resolveConversationPath(conversation))}
                    />
                  ))}

                  {conversations.length >= limit && (
                    <Button
                      onClick={handleLoadMore}
                      variant="ghost"
                      size="sm"
                      className="w-full text-white/60 hover:text-white"
                    >
                      Load more
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <div className="border-t border-white/10 p-2">
        <UserProfileMenu dropdownPlacement="top" />
      </div>

      <ProjectFormModal
        open={isProjectModalOpen}
        onOpenChange={setIsProjectModalOpen}
        onSuccess={handleProjectCreated}
      />
    </aside>
  )
}
